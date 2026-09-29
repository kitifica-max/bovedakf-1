# Netlify Edge WAF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a lightweight WAF using a single Netlify Edge Function that enforces rate limits (via Upstash Redis), blocks suspicious user-agents, and supports a manual IP blocklist — all configurable without touching the main logic file.

**Architecture:** One edge function (`waf.ts`) runs before every request. It imports all tunable values from `waf-config.ts`. Rate limiting uses Upstash Redis REST API via raw `fetch()` (no npm package — avoids Deno compatibility friction). The function fails open on Redis errors so it never takes down the site.

**Tech Stack:** Deno (Netlify Edge Functions runtime), Upstash Redis REST API, `netlify:edge` types

**Spec:** `docs/superpowers/specs/2026-09-14-netlify-waf-edge-design.md`

## Global Constraints

- Deno runtime — no CommonJS, no `require()`, no npm SDK imports; use `fetch()` for Upstash REST
- Import config with relative path: `import { ... } from "./waf-config.ts"`
- Import Netlify types: `import type { Context } from "netlify:edge"`
- Redis key prefix: `kf1-waf:` (distinct from app-layer `kf1-ratelimit:`)
- Fail open on any Redis error — log with `console.error`, return `context.next()`
- 429 response body: `{ "error": "Too many requests. Try again later." }` with `Content-Type: application/json` and `Retry-After` header set to `windowSec`
- 403 response body: plain text `"Forbidden"`
- All block events logged via `console.error` in format: `[WAF BLOCK] reason=<x> ip=<x> ua="<x>" path=<x> ts=<ISO8601>`
- Client IP read from `x-nf-client-connection-ip` header first, fallback to first value of `x-forwarded-for`
- No automated deploy — leave on `main` branch for manual deploy by the user

---

### Task 1: Create `waf-config.ts`

**Files:**
- Create: `netlify/edge-functions/waf-config.ts`

**Interfaces:**
- Produces:
  - `RATE_LIMITS: { auth, sensitive, general } → { max: number, windowSec: number }`
  - `AUTH_ROUTES: RegExp[]`
  - `SENSITIVE_ROUTES: RegExp[]`
  - `getRouteCategory(path: string): "auth" | "sensitive" | "general"`
  - `BLOCKED_UA_PATTERNS: RegExp[]`
  - `ALLOWED_BOT_PATTERNS: RegExp[]`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p netlify/edge-functions
```

- [ ] **Step 2: Write `waf-config.ts`**

```typescript
// netlify/edge-functions/waf-config.ts

export const RATE_LIMITS = {
  auth:      { max: 10, windowSec: 60 },
  sensitive: { max: 20, windowSec: 60 },
  general:   { max: 60, windowSec: 60 },
} as const;

export type RouteCategory = keyof typeof RATE_LIMITS;

const AUTH_ROUTES: RegExp[] = [
  /^\/login/,
  /^\/register/,
  /^\/verify/,
  /^\/reset\//,
  /^\/api\/auth\//,
];

const SENSITIVE_ROUTES: RegExp[] = [
  /^\/api\/share\//,
  /^\/checkout/,
  /^\/api\/credentials\//,
];

export function getRouteCategory(path: string): RouteCategory {
  if (AUTH_ROUTES.some((r) => r.test(path))) return "auth";
  if (SENSITIVE_ROUTES.some((r) => r.test(path))) return "sensitive";
  return "general";
}

// Checked AFTER allowlist — a bot in both lists passes through.
export const BLOCKED_UA_PATTERNS: RegExp[] = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /nuclei/i,
  /dirbuster/i,
  /gobuster/i,
  /python-requests\/[0-9]/i,
  /wfuzz/i,
  /hydra/i,
  /medusa/i,
  /burpsuite/i,
];

// These always pass through regardless of BLOCKED_UA_PATTERNS.
export const ALLOWED_BOT_PATTERNS: RegExp[] = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /facebot/i,
  /twitterbot/i,
];
```

- [ ] **Step 3: Verify the file was written correctly**

```bash
cat netlify/edge-functions/waf-config.ts
```

Expected: file contains `RATE_LIMITS`, `getRouteCategory`, `BLOCKED_UA_PATTERNS`, `ALLOWED_BOT_PATTERNS`.

- [ ] **Step 4: Commit**

```bash
git add netlify/edge-functions/waf-config.ts
git commit -m "feat(waf): add edge WAF config — rate limits, UA patterns, route categories"
```

---

### Task 2: Create `waf.ts`

**Files:**
- Create: `netlify/edge-functions/waf.ts`

**Interfaces:**
- Consumes: all exports from `./waf-config.ts`
- Consumes: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `WAF_BLOCKED_IPS` env vars
- Produces: default export Netlify Edge Function handler

- [ ] **Step 1: Write `waf.ts`**

```typescript
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

function getBlockedIps(): Set<string> {
  const raw = Deno.env.get("WAF_BLOCKED_IPS") ?? "";
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
}

function logBlock(reason: string, ip: string, ua: string, path: string): void {
  console.error(
    `[WAF BLOCK] reason=${reason} ip=${ip} ua="${ua}" path=${path} ts=${new Date().toISOString()}`
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

  if (!redisUrl || !redisToken) return true; // fail open — not configured

  try {
    const resp = await fetch(`${redisUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec],
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
  if (getBlockedIps().has(ip)) {
    logBlock("blocked_ip", ip, ua, path);
    return new Response("Forbidden", { status: 403 });
  }

  // 2. User-agent check — allowlist beats blocklist
  const isAllowedBot = ALLOWED_BOT_PATTERNS.some((p) => p.test(ua));
  if (!isAllowedBot) {
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
```

- [ ] **Step 2: Verify the file was written correctly**

```bash
cat netlify/edge-functions/waf.ts
```

Expected: file exports a default async function with three sequential checks (IP → UA → rate limit), each returning early on block.

- [ ] **Step 3: Commit**

```bash
git add netlify/edge-functions/waf.ts
git commit -m "feat(waf): add Netlify Edge WAF — rate limiting, UA blocking, IP blocklist"
```

---

### Task 3: Wire `netlify.toml` + update `.env.example`

**Files:**
- Modify: `netlify.toml` — add `[[edge_functions]]` block
- Modify: `.env.example` — document `WAF_BLOCKED_IPS`

**Interfaces:**
- Consumes: `netlify/edge-functions/waf.ts` (must exist from Task 2)

- [ ] **Step 1: Read current `netlify.toml`**

```bash
cat netlify.toml
```

Confirm existing blocks: `[build]`, `[[scheduled-functions]]`, `[[plugins]]`, `[[headers]]`.

- [ ] **Step 2: Add `[[edge_functions]]` block**

Add this block immediately before the `[[plugins]]` line in `netlify.toml`:

```toml
[[edge_functions]]
  function = "waf"
  path = "/*"

```

Result — the relevant section of `netlify.toml` should look like:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[scheduled-functions]]
  name = "check-subscriptions"
  schedule = "0 8 * * *"
  path = "/api/cron/check-subscriptions"

[[edge_functions]]
  function = "waf"
  path = "/*"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

- [ ] **Step 3: Add `WAF_BLOCKED_IPS` to `.env.example`**

Append this block at the end of `.env.example`:

```
# WAF — Netlify Edge Function perimeter protection
# Comma-separated IPs to block at the edge (no spaces around commas)
# Example: WAF_BLOCKED_IPS=1.2.3.4,5.6.7.8
# Update in Netlify dashboard env vars — no redeploy needed for new blocks
WAF_BLOCKED_IPS=
```

- [ ] **Step 4: Verify `netlify.toml` is valid TOML**

```bash
# Check for obvious syntax errors (no TOML linter available, use grep)
grep -c "^\[\[" netlify.toml
```

Expected: at least 4 (scheduled-functions, edge_functions, plugins, headers ×2).

- [ ] **Step 5: Commit**

```bash
git add netlify.toml .env.example
git commit -m "feat(waf): wire edge function in netlify.toml + document WAF_BLOCKED_IPS"
```

---

## How to Test Locally

Requires `netlify-cli` installed (`npm i -g netlify-cli`) and `.env` with Upstash vars.

```bash
# Start local dev with edge functions enabled
netlify dev

# Test 1: Rate limiting on auth route (limit: 10/min)
for i in {1..15}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/login)
  echo "Request $i: $code"
done
# Expected: requests 1-10 → 200, 11-15 → 429

# Test 2: Blocked scanner UA
curl -s -o /dev/null -w "%{http_code}\n" \
  -A "sqlmap/1.7.8#stable (https://sqlmap.org)" \
  http://localhost:8888/
# Expected: 403

# Test 3: Empty user-agent
curl -s -o /dev/null -w "%{http_code}\n" \
  -A "" \
  http://localhost:8888/
# Expected: 403

# Test 4: Googlebot allowed despite blocklist
curl -s -o /dev/null -w "%{http_code}\n" \
  -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  http://localhost:8888/
# Expected: 200

# Test 5: IP blocklist (your local IP)
MY_IP=$(curl -s https://api.ipify.org)
WAF_BLOCKED_IPS="$MY_IP" netlify dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8888/
# Expected: 403
```

Logs appear in the `netlify dev` terminal output tagged with `[WAF BLOCK]`.

---

## Deployment (manual)

```bash
git push origin main
# Then in Netlify dashboard:
# 1. Settings → Environment variables → Add WAF_BLOCKED_IPS (can be empty)
# 2. Confirm UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set
# 3. Trigger deploy or wait for auto-deploy from git push
```
