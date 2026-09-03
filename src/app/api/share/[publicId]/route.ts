import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { success } = rateLimit(`share:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Demasiadas solicitudes, intenta más tarde." }, { status: 429 });
  }

  const link = await db.shareLink.findUnique({
    where: { publicId },
    include: { credential: { select: { vaultId: true } } },
  });

  if (!link || link.revokedAt || link.expiresAt < new Date()) {
    await db.auditLog.create({
      data: {
        shareLinkId: link?.id,
        vaultId: link?.credential.vaultId,
        action: link ? "link_denied_expired_or_revoked" : "link_denied_not_found",
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });
    return NextResponse.json({ error: "Link inválido o expirado." }, { status: 410 });
  }

  await db.auditLog.create({
    data: {
      shareLinkId: link.id,
      vaultId: link.credential.vaultId,
      action: "link_viewed",
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  return NextResponse.json({
    payload: link.payload,
    permission: link.permission,
    expiresAt: link.expiresAt,
  });
}
