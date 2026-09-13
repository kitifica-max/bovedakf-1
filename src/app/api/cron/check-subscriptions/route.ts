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

  const active = await db.subscription.findMany({
    where: { status: { in: ["ACTIVE", "PENDING"] } },
    include: { user: true },
  });

  let suspended = 0;

  for (const sub of active) {
    try {
      const data = await getEnlaceSuscripciones(sub.wompiEnlaceId);
      const subscriber = data.items?.[0];

      if (!subscriber || !subscriber.activo) {
        await db.subscription.update({
          where: { id: sub.id },
          data: { status: "CANCELLED" },
        });
        suspended++;

        if (sub.user?.email) {
          const planName = sub.plan === "starter" ? "Starter" : "Equipo";
          const { subject, html } = paymentFailedEmail({ planName, manageUrl: "https://panel.wompi.sv" });
          await sendEmail(sub.user.email, subject, html);
        }
      }
    } catch (err) {
      console.error(`[cron] check subscription ${sub.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, checked: active.length, suspended });
}
