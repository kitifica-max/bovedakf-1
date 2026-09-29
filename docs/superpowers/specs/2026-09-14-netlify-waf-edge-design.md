# Netlify Edge WAF — Design Spec

## Goal

Implement a lightweight perimeter protection layer on KF-1 (kf1.kitifica.com) using Netlify Edge Functions (Deno runtime) to cover rate limiting, suspicious user-agent blocking, IP blocklisting, and structured blocking logs — without migrating DNS or adding external infrastructure beyond the already-provisioned Upstash Redis.

## Architecture

A single edge function (`waf.ts`) runs before every request hits the Next.js app. It reads from a separate configuration file (`waf-config.ts`) for all tunable values. The function uses Upstash Redis (already provisioned in the project) via its plain HTTPS REST API — compatible with Deno with zero npm dependencies.

```
Browser request
    ↓
Netlify Edge Function: waf.ts
    ├── 1. IP blocklist check      → 403 if blocked
    ├── 2. UA pattern check        → 403 if blocked
    ├── 3. Rate limit check        → 429 if over limit
    └── 4. next()                  → Next.js app handles request
```

## Tech Stack

- **Runtime:** Deno (Netlify Edge Functions)
- **Rate limit state:** Upstash Redis REST API (existing `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
- **Config:** `netlify/edge-functions/waf-config.ts` — plain TS object, no logic
- **Matcher:** `netlify.toml` `[[edge_functions]]` with `path = "/*"`

## Files

| File | Role |
|------|------|
| `netlify/edge-functions/waf.ts` | Main edge function logic |
| `netlify/edge-functions/waf-config.ts` | All tunable values: rate limits, UA patterns, allowed bots |
| `netlify.toml` | Add `[[edge_functions]]` matcher block |

## Global Constraints

- Deno runtime — no CommonJS, no npm packages, import via URL or `npm:` specifier only
- Rate limit keys prefixed `kf1-waf:` to avoid collisions with app-layer rate limits (`kf1-ratelimit:`)
- Upstash Redis accessed via raw `fetch()` to REST API (no SDK) — avoids Deno compatibility friction
- No deploy to production — user reviews and deploys manually
- Logging via `console.error()` — visible in Netlify Function logs dashboard

## Route Categories and Limits

| Category | Routes | Limit | Window |
|----------|--------|-------|--------|
| `auth` | `/login`, `/register`, `/verify`, `/reset/*`, `/api/auth/*`, `/api/auth/**` | 10 req | 60 s |
| `sensitive` | `/api/share/*`, `/api/share/**`, `/checkout*`, `/api/credentials/*` | 20 req | 60 s |
| `general` | Everything else | 60 req | 60 s |

Rate limit key: `kf1-waf:<category>:<ip>` — separate counters per category per IP.

## User-Agent Rules

- **Blocklist (deny):** sqlmap, nikto, nmap, masscan, zgrab, nuclei, dirbuster, gobuster, python-requests (bare), empty UA
- **Allowlist (always pass):** Googlebot, Bingbot, Slurp, DuckDuckBot
- Allowlist checked first — a bot in both lists passes
- All patterns maintained in `waf-config.ts`, not inline in `waf.ts`

## IP Blocklist

- Source: `WAF_BLOCKED_IPS` environment variable — comma-separated IPv4/IPv6 addresses
- Parsed once per function invocation (Edge Functions are warm but stateless per request)
- Example: `WAF_BLOCKED_IPS=1.2.3.4,5.6.7.8,::1`

## Logging Format

Every blocked request logs one line to stderr:

```
[WAF BLOCK] reason=<rate_limit|blocked_ua|blocked_ip> ip=<x.x.x.x> ua="<user-agent>" path=<path> ts=<ISO8601>
```

Logged via `console.error()` — appears in Netlify's "Function logs" tab filtered by edge function name.

## Rate Limiting Implementation

Uses Upstash Redis `INCR` + `EXPIRE` via REST fetch (sliding fixed window):

```
POST https://<host>/pipeline
[
  ["INCR", "kf1-waf:auth:1.2.3.4"],
  ["EXPIRE", "kf1-waf:auth:1.2.3.4", 60]
]
```

Pipeline call costs one HTTP round-trip (~5-15ms from Netlify edge PoPs to Upstash). INCR is atomic — no race conditions under concurrent requests from the same IP.

On Upstash fetch error (network timeout, quota), the WAF fails open (lets request through) and logs the error. This prevents the WAF from taking down the site if Redis is temporarily unreachable.

## netlify.toml Changes

```toml
[[edge_functions]]
  function = "waf"
  path = "/*"
```

Placed before the `[[plugins]]` block. The edge function runs before Next.js for every route including static assets — acceptable because the check is fast (<20ms) and static assets won't trigger rate limits under normal use.

## How to Tune (without touching waf.ts)

All tunable values are in `netlify/edge-functions/waf-config.ts`:

- **Rate limits:** Change `max` or `windowSec` per category
- **Add a blocked UA pattern:** Add a regex to `BLOCKED_UA_PATTERNS`
- **Block an IP in production:** Set/update `WAF_BLOCKED_IPS` env var in Netlify dashboard → redeploy not required (env vars take effect on next warm invocation)

## Limitations vs a Managed WAF

| Capability | This implementation | Cloudflare/AWS WAF |
|------------|--------------------|--------------------|
| Rate limiting (per IP) | ✅ Upstash Redis | ✅ native |
| UA pattern blocking | ✅ regex | ✅ + ML fingerprinting |
| IP blocklist (manual) | ✅ env var | ✅ + threat intelligence feeds |
| OWASP exploit rules (SQLi, XSS in body) | ❌ | ✅ managed rule sets |
| Advanced bot management (JS challenges, CAPTCHA) | ❌ | ✅ |
| Volumetric DDoS (L3/L4) | ❌ | ✅ absorbed at network level |
| Geo-blocking | ❌ | ✅ |
| Added latency | ~5-15ms | ~1-3ms |

**This implementation covers ~80% of automated superficial attacks (scanners, brute force, scrapers). It is a partial mitigation, not a replacement for a managed WAF.**

## How to Test Locally

```bash
# 1. Start local dev server
netlify dev

# 2. Test rate limiting (auth route — limit 10/min)
for i in {1..15}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8888/login; done
# First 10 → 200, from 11 onward → 429

# 3. Test UA blocking
curl -s -o /dev/null -w "%{http_code}\n" -A "sqlmap/1.0" http://localhost:8888/
# → 403

# 4. Test empty UA
curl -s -o /dev/null -w "%{http_code}\n" -A "" http://localhost:8888/
# → 403

# 5. Test IP blocklist
WAF_BLOCKED_IPS=127.0.0.1 netlify dev
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8888/
# → 403 (localhost IP is 127.0.0.1)
```

Note: Upstash Redis must be configured (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in `.env`) for rate limiting to be durable. Without it, the WAF fails open on rate limiting but still blocks UA/IP.
