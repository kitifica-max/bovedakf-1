import { NextRequest, NextResponse } from "next/server";
import { validateCliToken } from "@/lib/cli-auth";
import { db } from "@/lib/db";
import { decryptAtRest, encryptForLink, generateLinkKey, generatePublicId } from "@/lib/crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { anonymizeIp } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = clientIp(req.headers);
  const { success } = await rateLimit(`cli-share:${ip}`, 10);
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

  const { id } = await params;

  const credential = await db.credential.findFirst({
    where: {
      id,
      aiAccessible: true,
      vault: { members: { some: { userId: payload.userId } } },
    },
  });

  if (!credential) {
    return NextResponse.json({ error: "Credencial no encontrada" }, { status: 404 });
  }

  const plaintext = JSON.stringify({
    service: credential.service,
    username: credential.username,
    ...JSON.parse(decryptAtRest(credential.encryptedData)),
  });

  const linkKey = generateLinkKey();
  const publicId = generatePublicId();

  const created = await db.shareLink.create({
    data: {
      publicId,
      credentialId: credential.id,
      permission: "READ",
      payload: encryptForLink(plaintext, linkKey),
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    },
  });

  await db.auditLog.create({
    data: {
      vaultId: credential.vaultId,
      action: "link_created",
      shareLinkId: created.id,
      credentialService: credential.service,
      actorEmail: "cli-token",
      ipAddress: anonymizeIp(ip),
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kf1.kitifica.com";
  return NextResponse.json({
    url: `${appUrl}/s/${publicId}#k=${linkKey.toString("base64url")}`,
    expiresAt: created.expiresAt,
  });
}
