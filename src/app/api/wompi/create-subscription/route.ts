import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isPersonalEmail, TEAM_NEEDS_CORPORATE_EMAIL } from "@/lib/email-domains";

// ponytail: personal uses the starter link (same Wompi link, repriced to $3)
const PLAN_URLS: Record<string, string | undefined> = {
  personal: process.env.WOMPI_PERSONAL_URL ?? process.env.WOMPI_STARTER_URL,
  team: process.env.WOMPI_TEAM_URL,
  starter: process.env.WOMPI_STARTER_URL,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: string };
  const url = PLAN_URLS[plan];
  if (!url) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }
  if (plan === "team" && isPersonalEmail(session.user.email)) {
    return NextResponse.json({ error: TEAM_NEEDS_CORPORATE_EMAIL }, { status: 400 });
  }

  return NextResponse.json({ url });
}
