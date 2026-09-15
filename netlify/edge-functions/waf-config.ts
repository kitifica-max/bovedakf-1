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
