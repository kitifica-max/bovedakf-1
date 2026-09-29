import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { anonymizeIp, maybePurgeOldAuditLogs } from "@/lib/audit";
import { sendEmail, linkOpenedEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Carries a live (encrypted) secret — never let a proxy, CDN, or the browser
// cache the response.
const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate, private" };

export async function GET(req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const rawIp = clientIp(req.headers);
  const ip = anonymizeIp(rawIp); // what we persist; rate limit still uses rawIp

  const { success } = await rateLimit(`share:${rawIp}`);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes, intenta más tarde." },
      { status: 429, headers: NO_STORE }
    );
  }

  const link = await db.shareLink.findUnique({
    where: { publicId },
    include: {
      credential: {
        select: {
          vaultId: true,
          service: true,
          vault: { select: { owner: { select: { email: true } } } },
        },
      },
    },
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

  // First view? Tell the owner (once — later views are in the audit log only).
  const priorView = await db.auditLog.findFirst({
    where: { shareLinkId: link.id, action: "link_viewed" },
    select: { id: true },
  });

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

  if (!priorView) {
    const ownerEmail = link.credential.vault.owner.email;
    const { subject, html } = linkOpenedEmail(link.credential.service, APP_URL);
    await sendEmail(ownerEmail, subject, html);
  }

  await maybePurgeOldAuditLogs();

  return NextResponse.json(
    {
      payload: link.payload,
      permission: link.permission,
      expiresAt: link.expiresAt,
    },
    { headers: NO_STORE }
  );
}
