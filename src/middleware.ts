import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Nonce-based CSP (script-src with 'strict-dynamic', no 'unsafe-inline').
// Next.js's own hydration/RSC inline scripts pick up this nonce automatically
// once a Server Component reads it via headers() — see the root layout, which
// calls headers() to opt the whole render tree into that behavior. Our own
// hand-written inline scripts (the landing's JSON-LD) must be given the nonce
// explicitly via the `nonce` prop.
// Skipped outside production: Next dev needs 'unsafe-eval' for Turbopack/HMR,
// which this strict policy doesn't grant.
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-192.png|icon-512.png|apple-touch-icon.png).*)",
  ],
};
