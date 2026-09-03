import { db } from "@/lib/db";

const RETENTION_DAYS = 180;

// GDPR data-minimization: store enough to tell networks apart, not enough to
// single out a person. IPv4 → /24, IPv6 → /48. Use the raw IP for rate
// limiting; only the persisted `ipAddress` gets truncated.
export function anonymizeIp(ip: string): string {
  if (!ip || ip === "unknown") return "unknown";
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":") + "::";
  const o = ip.split(".");
  return o.length === 4 ? `${o[0]}.${o[1]}.${o[2]}.0` : "unknown";
}

// Opportunistic retention purge — runs inline on ~1 in 10 audit writes, so
// no cron/scheduled function is needed.
// ponytail: fine at this volume; move to a scheduled job if AuditLog grows
// past a few 100k rows (deleteMany with no createdAt index would get slow).
export async function maybePurgeOldAuditLogs(): Promise<void> {
  if (Math.random() >= 0.1) return;
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);
  try {
    await db.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  } catch {
    // best-effort; never block the request on cleanup
  }
}
