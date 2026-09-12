import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const PLAN_IDS: Record<string, string> = {
  starter: process.env.PAYPAL_PLAN_STARTER_ID ?? "",
  team: process.env.PAYPAL_PLAN_TEAM_ID ?? "",
};

async function getToken() {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const d = await res.json() as { access_token: string };
  return d.access_token;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login?from=/#precios", req.url));
  }

  const { plan } = (await req.json()) as { plan: string };
  const planId = PLAN_IDS[plan];
  if (!planId) return NextResponse.json({ error: "Plan inválido" }, { status: 400 });

  const token = await getToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kf1.kitifica.com";

  const res = await fetch(`${BASE_URL}/v1/billing/subscriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: planId,
      subscriber: { email_address: session.user.email },
      application_context: {
        brand_name: "Bóveda KF-1",
        locale: "es-ES",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${appUrl}/api/paypal/return`,
        cancel_url: `${appUrl}/#precios`,
      },
    }),
  });

  const sub = await res.json() as { id: string; links: { rel: string; href: string }[] };
  const approvalLink = sub.links?.find((l) => l.rel === "approve")?.href;
  if (!approvalLink) return NextResponse.json({ error: "No approval link" }, { status: 500 });

  return NextResponse.json({ url: approvalLink });
}
