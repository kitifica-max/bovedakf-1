import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listEnlacesPagoRecurrentes, getEnlaceSuscripciones } from "@/lib/wompi";
import { sendEmail, paymentFailedEmail, trialReminderEmail } from "@/lib/email";
import { trialStep, GRACE_DAYS, DAY_MS } from "@/lib/plan-state";

// Netlify scheduled function: runs daily at 8:00 AM UTC
// netlify.toml → [[scheduled-functions]] schedule = "0 8 * * *"
// Also callable via GET /api/cron/check-subscriptions?secret=CRON_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  // Netlify scheduled functions hit the path directly without query params
  // but include the x-netlify-event: schedule header as proof of origin.
  const isNetlifyScheduled = req.headers.get("x-netlify-event") === "schedule";
  if (!isNetlifyScheduled && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Trials run first: independent of Wompi, so a Wompi outage can't stall reminders or purges.
  const trials = await processTrials();

  // Discover our plan links dynamically from the Wompi account
  let enlaces: Awaited<ReturnType<typeof listEnlacesPagoRecurrentes>>;
  try {
    enlaces = await listEnlacesPagoRecurrentes();
  } catch (err) {
    console.error("[cron] failed to list Wompi enlaces:", err);
    return NextResponse.json({ ok: false, trials, error: String(err) }, { status: 500 });
  }

  const personalUrl = process.env.WOMPI_PERSONAL_URL ?? "";
  const starterUrl = process.env.WOMPI_STARTER_URL ?? "";
  const teamUrl = process.env.WOMPI_TEAM_URL ?? "";

  // Match by short URL to identify which enlace belongs to which plan
  const personalEnlace = personalUrl ? enlaces.find((e) => e.urlEnlace === personalUrl) : undefined;
  const starterEnlace = starterUrl ? enlaces.find((e) => e.urlEnlace === starterUrl || e.urlEnlace.endsWith("2222632b7I")) : undefined;
  const teamEnlace = teamUrl ? enlaces.find((e) => e.urlEnlace === teamUrl || e.urlEnlace.endsWith("2222637FpK")) : undefined;

  if (!personalEnlace && !starterEnlace && !teamEnlace) {
    console.warn("[cron] could not find plan enlaces in Wompi account");
    return NextResponse.json({ ok: true, trials, skipped: true });
  }

  // Build set of active subscriber emails from Wompi
  const activeEmails = new Set<string>();
  for (const enlace of [personalEnlace, starterEnlace, teamEnlace]) {
    if (!enlace) continue;
    try {
      const data = await getEnlaceSuscripciones(enlace.idEnlace);
      for (const s of data.items ?? []) {
        if (s.activo) activeEmails.add(s.email.toLowerCase());
      }
    } catch (err) {
      console.error(`[cron] failed to get suscripciones for enlace ${enlace.idEnlace}:`, err);
    }
  }

  const active = await db.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { user: true },
  });

  let suspended = 0;
  for (const sub of active) {
    const email = sub.user?.email;
    if (!email) continue;

    if (!activeEmails.has(email.toLowerCase())) {
      await db.subscription.update({
        where: { id: sub.id },
        data: { status: "SUSPENDED" },
      });
      suspended++;

      const PLAN_NAMES: Record<string, string> = { personal: "Personal", starter: "Personal", team: "Equipo" };
      const planName = PLAN_NAMES[sub.plan] ?? sub.plan;
      const { subject, html } = paymentFailedEmail({ planName, manageUrl: "https://panel.wompi.sv" });
      await sendEmail(email, subject, html);
    }
  }

  return NextResponse.json({ ok: true, trials, checked: active.length, suspended });
}

const PLAN_NAME: Record<string, string> = { personal: "Personal", starter: "Personal", team: "Equipo" };
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kf1.kitifica.com";

async function processTrials() {
  const subs = await db.subscription.findMany({
    where: { status: "TRIALING", currentPeriodEnd: { lt: new Date() } },
    include: { user: { select: { email: true } } },
  });

  let reminded = 0;
  let purged = 0;
  for (const sub of subs) {
    const step = trialStep(sub);
    const planName = PLAN_NAME[sub.plan] ?? sub.plan;

    if (step.action === "remind") {
      const deleteDate = new Date(sub.currentPeriodEnd.getTime() + GRACE_DAYS * DAY_MS)
        .toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
      const { subject, html } = trialReminderEmail({
        n: step.n,
        planName,
        deleteDate,
        checkoutUrl: `${APP_URL}/checkout?plan=${sub.plan === "team" ? "team" : "personal"}`,
      });
      const sent = await sendEmail(sub.user.email, subject, html);
      // Only advance on success so a Resend outage retries next run.
      if (sent.ok) {
        await db.subscription.update({ where: { id: sub.id }, data: { remindersSent: step.n } });
        reminded++;
      }
    }

    if (step.action === "purge") {
      // Irreversible: the account survives on the free plan, its credentials don't.
      // Conditional on still TRIALING, so a payment landing mid-run wins over the purge.
      const done = await db.$transaction(async (tx) => {
        const { count } = await tx.subscription.deleteMany({ where: { id: sub.id, status: "TRIALING" } });
        if (count === 0) return false;
        const vaults = await tx.vault.findMany({ where: { ownerId: sub.userId }, select: { id: true } });
        await tx.credential.deleteMany({ where: { vault: { ownerId: sub.userId } } });
        await tx.auditLog.createMany({
          data: vaults.map((v) => ({ vaultId: v.id, action: "trial_data_purged", actorEmail: "system" })),
        });
        return true;
      });
      if (done) purged++;
    }
  }
  return { expired: subs.length, reminded, purged };
}
