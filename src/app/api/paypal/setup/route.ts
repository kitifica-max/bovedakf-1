import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

const BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

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

async function pp(path: string, body: unknown, token: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// POST /api/paypal/setup — admin-only, run once to create product + plans
export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await getToken();

  // 1. Create product
  const product = await pp("/v1/catalogs/products", {
    name: "Bóveda KF-1",
    description: "Gestor seguro de credenciales para equipos",
    type: "SERVICE",
    category: "SOFTWARE",
  }, token);

  const productId: string = product.id;

  // 2. Create Starter plan — $9/mes, 5 seats
  const starter = await pp("/v1/billing/plans", {
    product_id: productId,
    name: "Starter",
    description: "Hasta 5 usuarios · $9/mes",
    billing_cycles: [
      {
        frequency: { interval_unit: "MONTH", interval_count: 1 },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: "9", currency_code: "USD" } },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: { value: "0", currency_code: "USD" },
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  }, token);

  // 3. Create Team plan — $29/mes, 25 seats
  const team = await pp("/v1/billing/plans", {
    product_id: productId,
    name: "Equipo",
    description: "Hasta 25 usuarios · $29/mes",
    billing_cycles: [
      {
        frequency: { interval_unit: "MONTH", interval_count: 1 },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: "29", currency_code: "USD" } },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: { value: "0", currency_code: "USD" },
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  }, token);

  return NextResponse.json({
    product_id: productId,
    starter_plan_id: starter.id,
    team_plan_id: team.id,
    instructions: "Agrega estos IDs a .env.local y Netlify:\nPAYPAL_PLAN_STARTER_ID=...\nPAYPAL_PLAN_TEAM_ID=...",
  });
}
