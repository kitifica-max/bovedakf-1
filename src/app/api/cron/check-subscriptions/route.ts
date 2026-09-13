import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEnlaceSuscripciones } from "@/lib/wompi";
import { sendEmail, paymentFailedEmail } from "@/lib/email";

// Netlify scheduled function: runs daily at 8:00 AM UTC
// netlify.toml → [[scheduled-functions]] schedule = "0 8 * * *"
// Also callable via GET /api/cron/check-subscriptions?secret=CRON_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const starterEnlaceId = process.env.WOMPI_STARTER_ENLACE_ID;
  const teamEnlaceId = process.env.WOMPI_TEAM_ENLACE_ID;

  if (!starterEnlaceId || !teamEnlaceId) {
    console.warn("[cron] WOMPI_STARTER_ENLACE_ID or WOMPI_TEAM_ENLACE_ID not set — skipping cancellation check");
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Build set of active subscriber emails per plan from Wompi
  const activeEmails = new Set<string>();
  try {
    const [starterData, teamData] = await Promise.all([
      getEnlaceSuscripciones(starterEnlaceId),
      getEnlaceSuscripciones(teamEnlaceId),
    ]);
    for (const s of starterData.items ?? []) {
      if (s.activo) activeEmails.add(s.email.toLowerCase());
    }
    for (const s of teamData.items ?? []) {
      if (s.activo) activeEmails.add(s.email.toLowerCase());
    }
  } catch (err) {
    console.error("[cron] failed to fetch Wompi subscriptions:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
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
        data: { status: "CANCELLED" },
      });
      suspended++;

      const planName = sub.plan === "starter" ? "Starter" : "Equipo";
      const { subject, html } = paymentFailedEmail({ planName, manageUrl: "https://panel.wompi.sv" });
      await sendEmail(email, subject, html);
    }
  }

  return NextResponse.json({ ok: true, checked: active.length, suspended });
}
