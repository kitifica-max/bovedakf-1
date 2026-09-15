// netlify/edge-functions/waf.ts
import type { Context } from "netlify:edge";
import {
  RATE_LIMITS,
  BLOCKED_UA_PATTERNS,
  ALLOWED_BOT_PATTERNS,
  getRouteCategory,
} from "./waf-config.ts";

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

// Parse blocked IPs once at module level — avoids re-parsing on every request
const BLOCKED_IPS: Set<string> = new Set(
  (Deno.env.get("WAF_BLOCKED_IPS") ?? "").split(",").map((s) => s.trim()).filter(Boolean)
);

// Machine-to-machine routes exempt from UA check (webhooks, OAuth discovery, MCP/CLI)
const UA_EXEMPT_PATHS = [/^\/api\/wompi\//, /^\/.well-known\//, /^\/api\/mcp/, /^\/api\/cli\//];

function logBlock(reason: string, ip: string, ua: string, path: string): void {
  console.error(
    `[WAF BLOCK] reason=${reason} ip=${ip} ua=${JSON.stringify(ua)} path=${path} ts=${new Date().toISOString()}`
  );
}

async function checkRateLimit(
  ip: string,
  category: keyof typeof RATE_LIMITS
): Promise<boolean> {
  const { max, windowSec } = RATE_LIMITS[category];
  const key = `kf1-waf:${category}:${ip}`;

  const redisUrl = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const redisToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");

  if (!redisUrl || !redisToken) {
    console.error("[WAF ERROR] Upstash not configured — rate limiting disabled");
    return true; // fail open
  }

  try {
    const resp = await fetch(`${redisUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec, "NX"],
      ]),
    });

    if (!resp.ok) {
      console.error(`[WAF ERROR] Redis responded ${resp.status}`);
      return true; // fail open
    }

    const data = (await resp.json()) as Array<{ result: number }>;
    const count = data[0]?.result ?? 0;
    return count <= max;
  } catch (err) {
    console.error(`[WAF ERROR] Redis fetch threw: ${err}`);
    return true; // fail open
  }
}

export default async function waf(
  request: Request,
  context: Context
): Promise<Response> {
  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent") ?? "";
  const path = new URL(request.url).pathname;

  // 1. IP blocklist — fastest check, no async
  if (BLOCKED_IPS.has(ip)) {
    logBlock("blocked_ip", ip, ua, path);
    return new Response("Forbidden", { status: 403 });
  }

  // 2. User-agent check — allowlist beats blocklist; exempt M2M paths
  const isAllowedBot = ALLOWED_BOT_PATTERNS.some((p) => p.test(ua));
  const isUAExempt = UA_EXEMPT_PATHS.some((p) => p.test(path));

  if (!isAllowedBot && !isUAExempt) {
    const isBadUA = ua === "" || BLOCKED_UA_PATTERNS.some((p) => p.test(ua));
    if (isBadUA) {
      logBlock("blocked_ua", ip, ua, path);
      return new Response("Forbidden", { status: 403 });
    }
  }

  // 3. Rate limiting via Upstash Redis
  const category = getRouteCategory(path);
  const allowed = await checkRateLimit(ip, category);
  if (!allowed) {
    logBlock("rate_limit", ip, ua, path);
    return new Response(
      JSON.stringify({ error: "Too many requests. Try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(RATE_LIMITS[category].windowSec),
        },
      }
    );
  }

  return context.next();
}
