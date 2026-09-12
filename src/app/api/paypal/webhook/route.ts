import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";
import { sendEmail, paymentSuccessEmail, paymentFailedEmail } from "@/lib/email";
import { generateReceipt } from "@/lib/pdf";

type PayPalEvent = {
  event_type: string;
  resource: {
    id: string;
    plan_id?: string;
    billing_agreement_id?: string; // subscription ID on PAYMENT.SALE.* events
    subscriber?: { email_address: string };
    status?: string;
    billing_info?: { next_billing_time?: string };
    amount?: { total: string; currency_code?: string };
  };
};

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  SUSPENDED: "SUSPENDED",
  EXPIRED: "EXPIRED",
};

const PLAN_SEATS: Record<string, { plan: "starter" | "team"; seats: number; name: string }> = {
  [process.env.PAYPAL_PLAN_STARTER_ID ?? ""]: { plan: "starter", seats: 5, name: "Starter" },
  [process.env.PAYPAL_PLAN_TEAM_ID ?? ""]: { plan: "team", seats: 25, name: "Equipo" },
};

const PLAN_PRICE: Record<string, string> = { starter: "9.00", team: "29.00" };

const PAYPAL_MANAGE_URL = "https://www.paypal.com/myaccount/autopay/";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PayPalEvent;
  const { event_type, resource } = body;

  // ── Subscription activated ───────────────────────────────────────────
  if (event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
    const planInfo = PLAN_SEATS[resource.plan_id ?? ""];
    if (!planInfo) return NextResponse.json({ ok: true });

    const email = resource.subscriber?.email_address;
    if (!email) return NextResponse.json({ ok: true });

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ ok: true });

    const periodEnd = resource.billing_info?.next_billing_time
      ? new Date(resource.billing_info.next_billing_time)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: planInfo.plan,
        paypalSubscriptionId: resource.id,
        status: "ACTIVE",
        seats: planInfo.seats,
        currentPeriodEnd: periodEnd,
      },
      update: {
        plan: planInfo.plan,
        paypalSubscriptionId: resource.id,
        status: "ACTIVE",
        seats: planInfo.seats,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  // ── Subscription cancelled / suspended / expired ─────────────────────
  if (
    event_type === "BILLING.SUBSCRIPTION.CANCELLED" ||
    event_type === "BILLING.SUBSCRIPTION.SUSPENDED" ||
    event_type === "BILLING.SUBSCRIPTION.EXPIRED"
  ) {
    const newStatus = STATUS_MAP[resource.status ?? "CANCELLED"] ?? "CANCELLED";
    await db.subscription.updateMany({
      where: { paypalSubscriptionId: resource.id },
      data: { status: newStatus },
    });
  }

  // ── Payment failed ────────────────────────────────────────────────────
  if (event_type === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
    const sub = await db.subscription.findFirst({
      where: { paypalSubscriptionId: resource.id },
      include: { user: true },
    });
    if (sub?.user?.email) {
      const planName = sub.plan === "starter" ? "Starter" : "Equipo";
      const { subject, html } = paymentFailedEmail({ planName, manageUrl: PAYPAL_MANAGE_URL });
      await sendEmail(sub.user.email, subject, html);
    }
  }

  // ── Payment completed — extend period + send receipt ─────────────────
  if (event_type === "PAYMENT.SALE.COMPLETED") {
    // resource.id = sale ID; resource.billing_agreement_id = subscription ID
    const subscriptionId = resource.billing_agreement_id;
    if (!subscriptionId) return NextResponse.json({ ok: true });

    const sub = await db.subscription.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
      include: { user: true },
    });
    if (!sub) return NextResponse.json({ ok: true });

    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.subscription.update({
      where: { id: sub.id },
      data: { status: "ACTIVE", currentPeriodEnd: periodEnd },
    });

    if (sub.user?.email) {
      const planName = sub.plan === "starter" ? "Starter" : "Equipo";
      const amount = resource.amount?.total ?? PLAN_PRICE[sub.plan] ?? "0.00";
      const currency = resource.amount?.currency_code ?? "USD";
      const nextDate = periodEnd.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

      // Generate PDF receipt
      let pdfAttachment: { filename: string; content: string }[] | undefined;
      try {
        const pdfBuffer = await generateReceipt({
          userEmail: sub.user.email,
          planName,
          amount,
          currency,
          transactionId: resource.id,
          subscriptionId,
          date: new Date(),
        });
        pdfAttachment = [{ filename: "recibo-kf1.pdf", content: pdfBuffer.toString("base64") }];
      } catch (err) {
        console.error("[webhook] PDF generation failed", err);
      }

      const { subject, html } = paymentSuccessEmail({ planName, amount, currency, nextBillingDate: nextDate });
      await sendEmail(sub.user.email, subject, html, pdfAttachment);
    }
  }

  return NextResponse.json({ ok: true });
}
