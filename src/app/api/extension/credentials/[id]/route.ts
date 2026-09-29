import { NextRequest, NextResponse } from "next/server";
import { validateCliToken } from "@/lib/cli-auth";
import { db } from "@/lib/db";
import { decryptAtRest } from "@/lib/crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = clientIp(req.headers);
  const { success } = await rateLimit(`ext-fill:${ip}`, 20);
  if (!success) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 });

  const payload = await validateCliToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });

  const { id } = await params;

  const credential = await db.credential.findFirst({
    where: {
      id,
      vault: { members: { some: { userId: payload.userId } } },
    },
  });

  if (!credential) return NextResponse.json({ error: "Credencial no encontrada" }, { status: 404 });

  const decrypted = JSON.parse(decryptAtRest(credential.encryptedData)) as { secret: string; notes?: string };

  return NextResponse.json({
    id: credential.id,
    service: credential.service,
    username: credential.username,
    password: decrypted.secret,
  });
}
