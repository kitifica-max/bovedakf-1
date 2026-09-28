import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listEnlacesPagoRecurrentes, getEnlaceSuscripciones } from "@/lib/wompi";
import { sendEmail, paymentFailedEmail } from "@/lib/email";

// Netlify scheduled function: runs daily at 8:00 AM UTC
// netlify.toml → [[scheduled-functions]] schedule = "0 8 * * *"
// Also callable via GET /api/cron/check-subscriptions?secret=CRON_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Discover our plan links dynamically from the Wompi account
  let enlaces: Awaited<ReturnType<typeof listEnlacesPagoRecurrentes>>;
  try {
    enlaces = await listEnlacesPagoRecurrentes();
  } catch (err) {
    console.error("[cron] failed to list Wompi enlaces:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
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
    return NextResponse.json({ ok: true, skipped: true });
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

  return NextResponse.json({ ok: true, checked: active.length, suspended });
}
