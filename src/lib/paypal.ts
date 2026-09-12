const BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function paypalFetch(path: string, options?: RequestInit) {
  const token = await getAccessToken();
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
}

export async function getSubscription(subscriptionId: string) {
  const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`);
  return res.json();
}

export async function cancelSubscription(subscriptionId: string, reason: string) {
  await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export const PLANS = {
  starter: {
    id: process.env.PAYPAL_PLAN_STARTER_ID,
    name: "Starter",
    price: 9,
    seats: 5,
    description: "Para equipos pequeños — hasta 5 usuarios",
  },
  team: {
    id: process.env.PAYPAL_PLAN_TEAM_ID,
    name: "Equipo",
    price: 29,
    seats: 25,
    description: "Para equipos medianos — hasta 25 usuarios",
  },
} as const;
