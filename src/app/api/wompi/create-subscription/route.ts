import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PLAN_URLS: Record<string, string | undefined> = {
  starter: process.env.WOMPI_STARTER_URL,
  team: process.env.WOMPI_TEAM_URL,
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

  return NextResponse.json({ url });
}
