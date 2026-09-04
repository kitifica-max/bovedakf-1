import type { NextConfig } from "next";

// Credential vault — deny framing outright and keep response headers from
// fingerprinting the stack more than they need to.
// Content-Security-Policy is set per-request in middleware.ts (it needs a
// fresh nonce every time) — everything static stays here.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  async headers() {
    // Dev mode needs eval() (React Refresh) and a WS connection for HMR —
    // apply the strict CSP only to the deployed build.
    if (process.env.NODE_ENV !== "production") return [];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
