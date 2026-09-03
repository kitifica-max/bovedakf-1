import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Carries a live (encrypted) secret — never let a proxy, CDN, or the browser
// cache the response.
const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate, private" };

export async function GET(req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const ip = clientIp(req.headers);

  const { success } = rateLimit(`share:${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes, intenta más tarde." },
      { status: 429, headers: NO_STORE }
    );
  }

  const link = await db.shareLink.findUnique({
    where: { publicId },
    include: { credential: { select: { vaultId: true, service: true } } },
  });

  if (!link || link.revokedAt || link.expiresAt < new Date()) {
    await db.auditLog.create({
      data: {
        shareLinkId: link?.id,
        vaultId: link?.credential.vaultId,
        action: link ? "link_denied_expired_or_revoked" : "link_denied_not_found",
        credentialService: link?.credential.service,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });
    return NextResponse.json({ error: "Link inválido o expirado." }, { status: 410, headers: NO_STORE });
  }

  await db.auditLog.create({
    data: {
      shareLinkId: link.id,
      vaultId: link.credential.vaultId,
      action: "link_viewed",
      credentialService: link.credential.service,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  return NextResponse.json(
    {
      payload: link.payload,
      permission: link.permission,
      expiresAt: link.expiresAt,
    },
    { headers: NO_STORE }
  );
}
