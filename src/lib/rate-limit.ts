import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Durable rate limiting via Upstash Redis (a plain HTTPS API — works from any
// serverless runtime, Netlify Functions included, not just Vercel). Falls
// back to an in-memory sliding window when the two env vars below aren't
// set, so local dev and any deploy without Upstash provisioned keep working.
// The in-memory fallback resets whenever the process/function instance
// recycles — on Netlify that can be every few invocations — so it's a
// degraded mode, not a substitute for the real thing in production.
const WINDOW_MS = 60_000;
const DEFAULT_MAX = 20;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// One limiter per distinct `max` value — Ratelimit instances are cheap and
// stateless client-side, and call sites only ever use a handful of values.
const limiters = new Map<number, Ratelimit>();
function limiterFor(max: number): Ratelimit {
  let l = limiters.get(max);
  if (!l) {
    l = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(max, "60 s"),
      // Every call already namespaces its own key ("login:<ip>", "share:<ip>", ...).
      prefix: "kf1-ratelimit",
    });
    limiters.set(max, l);
  }
  return l;
}

const hits = new Map<string, number[]>();
function rateLimitMemory(key: string, max: number): { success: boolean } {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return { success: timestamps.length <= max };
}

export async function rateLimit(key: string, max = DEFAULT_MAX): Promise<{ success: boolean }> {
  if (!redis) return rateLimitMemory(key, max);
  try {
    const { success } = await limiterFor(max).limit(key);
    return { success };
  } catch {
    // Upstash unreachable — fail open on the network call, not on security:
    // the in-memory window still applies as a backstop for this instance.
    return rateLimitMemory(key, max);
  }
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
