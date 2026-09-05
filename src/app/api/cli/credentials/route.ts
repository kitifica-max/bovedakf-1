import { NextRequest, NextResponse } from "next/server";
import { validateCliToken } from "@/lib/cli-auth";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const { success } = await rateLimit(`cli:${ip}`, 30);
  if (!success) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Token requerido" }, { status: 401 });
  }

  const payload = await validateCliToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
  }

  const memberships = await db.vaultMember.findMany({
    where: { userId: payload.userId },
    select: { vaultId: true },
  });

  const vaultIds = memberships.map((m) => m.vaultId);

  const credentials = await db.credential.findMany({
    where: {
      vaultId: { in: vaultIds },
      aiAccessible: true,
    },
    select: {
      id: true,
      service: true,
      username: true,
      vaultId: true,
      notes: true,
    },
    orderBy: { service: "asc" },
  });

  return NextResponse.json({ credentials });
}
