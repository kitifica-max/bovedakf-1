import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSubscription } from "@/lib/paypal";

const PLAN_SEATS: Record<string, { plan: "starter" | "team"; seats: number }> = {
  [process.env.PAYPAL_PLAN_STARTER_ID ?? ""]: { plan: "starter", seats: 5 },
  [process.env.PAYPAL_PLAN_TEAM_ID ?? ""]: { plan: "team", seats: 25 },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subscriptionId } = (await req.json()) as { subscriptionId: string };
  if (!subscriptionId) return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });

  const sub = await getSubscription(subscriptionId);
  const planInfo = PLAN_SEATS[sub.plan_id ?? ""];
  if (!planInfo) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  const periodEnd = sub.billing_info?.next_billing_time
    ? new Date(sub.billing_info.next_billing_time)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      plan: planInfo.plan,
      paypalSubscriptionId: subscriptionId,
      status: "ACTIVE",
      seats: planInfo.seats,
      currentPeriodEnd: periodEnd,
    },
    update: {
      plan: planInfo.plan,
      paypalSubscriptionId: subscriptionId,
      status: "ACTIVE",
      seats: planInfo.seats,
      currentPeriodEnd: periodEnd,
    },
  });

  return NextResponse.json({ ok: true });
}
