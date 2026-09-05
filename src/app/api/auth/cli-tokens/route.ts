import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCliToken, listCliTokens } from "@/lib/cli-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const tokens = await listCliTokens(session.user.id);
  return NextResponse.json({ tokens });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const { success } = await rateLimit(`cli-token:${ip}`, 5);
  if (!success) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name || name.length > 64) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }

  const { token, expiresAt } = await createCliToken(session.user.id, name);
  return NextResponse.json({ token, expiresAt }, { status: 201 });
}
