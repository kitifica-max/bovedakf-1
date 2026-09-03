// ponytail: in-memory sliding window, single-instance only. Upgrade to
// Upstash Redis (see @/lib/rate-limit's TODO) once the project is linked to
// Vercel and the Upstash integration is provisioned — needed before scaling
// past one server instance.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export function rateLimit(key: string) {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return { success: timestamps.length <= MAX_REQUESTS };
}
