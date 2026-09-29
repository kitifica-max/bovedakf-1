// netlify/edge-functions/waf-config.ts

// general must absorb normal browsing: one page view fans out into RSC
// prefetches for every visible <Link> plus NextAuth's /api/auth/session poll.
export const RATE_LIMITS = {
  auth:      { max: 20, windowSec: 60 },
  sensitive: { max: 30, windowSec: 60 },
  general:   { max: 300, windowSec: 60 },
} as const;

export type RouteCategory = keyof typeof RATE_LIMITS;

const AUTH_ROUTES: RegExp[] = [
  /^\/login/,
  /^\/register/,
  /^\/verify/,
  /^\/reset/,          // covers /reset and /reset/anything
  /^\/invite\//,       // invite token route (brute-forceable)
  /^\/api\/auth/,      // covers /api/auth exactly and /api/auth/…
];

const SENSITIVE_ROUTES: RegExp[] = [
  /^\/api\/share\//,
  /^\/s\//,                    // public share link viewer — brute-forceable publicId
  /^\/checkout/,
  /^\/api\/cli\/credentials/,
  /^\/api\/mcp/,
];

// Brute force only happens on submits (sign-in callback, server actions are
// POSTs to the page path). GETs of auth pages — page loads, RSC prefetches,
// /api/auth/session and /csrf — share the general budget; counting them as
// "auth" locked real users out mid-session. Server actions keep their own
// per-IP limits in src/lib/rate-limit.ts as a second layer.
export function getRouteCategory(path: string, method = "GET"): RouteCategory {
  if (method === "POST" && AUTH_ROUTES.some((r) => r.test(path))) return "auth";
  if (SENSITIVE_ROUTES.some((r) => r.test(path))) return "sensitive";
  return "general";
}

// Public files served as-is; never worth a Redis round-trip or a 429.
export const STATIC_FILE = /\.(?:svg|png|jpe?g|webp|gif|ico|txt|xml|webmanifest|mp4|webm|zip|woff2?)$|^\/(?:manifest\.json|sw\.js)$/;

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
