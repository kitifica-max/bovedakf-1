import { NextRequest, NextResponse } from "next/server";
import { validateCliToken } from "@/lib/cli-auth";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const { success } = await rateLimit(`ext:${ip}`, 30);
  if (!success) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 });

  const payload = await validateCliToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });

  const memberships = await db.vaultMember.findMany({
    where: { userId: payload.userId },
    select: { vaultId: true },
  });

  const credentials = await db.credential.findMany({
    where: { vaultId: { in: memberships.map((m) => m.vaultId) } },
    select: { id: true, service: true, username: true },
    orderBy: { service: "asc" },
  });

  return NextResponse.json({ credentials });
}
