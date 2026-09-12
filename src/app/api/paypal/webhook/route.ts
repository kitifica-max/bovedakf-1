import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";

type PayPalEvent = {
  event_type: string;
  resource: {
    id: string;
    plan_id?: string;
    subscriber?: { email_address: string };
    status?: string;
    billing_info?: { next_billing_time?: string };
  };
};

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  SUSPENDED: "SUSPENDED",
  EXPIRED: "EXPIRED",
};

const PLAN_SEATS: Record<string, { plan: "starter" | "team"; seats: number }> = {
  [process.env.PAYPAL_PLAN_STARTER_ID ?? ""]: { plan: "starter", seats: 5 },
  [process.env.PAYPAL_PLAN_TEAM_ID ?? ""]: { plan: "team", seats: 25 },
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PayPalEvent;
  const { event_type, resource } = body;

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

  if (event_type === "PAYMENT.SALE.COMPLETED") {
    // Extend billing period on successful payment
    const sub = await db.subscription.findFirst({
      where: { paypalSubscriptionId: resource.id },
    });
    if (sub) {
      await db.subscription.update({
        where: { id: sub.id },
        data: {
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
