// ponytail: in-memory sliding window, single-instance only. Upgrade to
// Upstash Redis (see @/lib/rate-limit's TODO) once the project is linked to
// Vercel and the Upstash integration is provisioned — needed before scaling
// past one server instance.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export function rateLimit(key: string, max = MAX_REQUESTS) {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return { success: timestamps.length <= max };
}

// Real client IP. `x-forwarded-for` is client-controllable on its left side,
// so never trust `split(",")[0]`. Netlify sets x-nf-client-connection-ip to
// the actual TCP peer; fall back to the RIGHTMOST x-forwarded-for hop, which
// is the one the platform appended.
export function clientIp(h: Headers): string {
  const nf = h.get("x-nf-client-connection-ip");
  if (nf) return nf.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}
