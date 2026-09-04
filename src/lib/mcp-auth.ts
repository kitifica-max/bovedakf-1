// MCP OAuth token generation and validation.
// Uses the same AUTH_SECRET as NextAuth for JWT signing, keeping a single
// secret hierarchy. Tokens are short-lived (15 min) and single-use for
// credential reads.

import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const ISSUER = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── JWT-like token (HMAC-SHA256 signed, no JWS library needed) ──────────

function base64url(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(payload: Record<string, unknown>, secret: string): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest();
  return `${header}.${body}.${base64url(sig)}`;
}

export function verifyToken(token: string, secret: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest();
  const actual = Buffer.from(sig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    if (payload.exp && Date.now() > payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export type McpTokenPayload = {
  sub: string;       // userId
  email: string;
  vaultId: string;
  jti: string;       // unique token ID for revocation tracking
  scope: string;     // space-separated scopes
  client_id: string;
  iat: number;
  exp: number;
  iss: string;
};

export function generateToken(params: {
  userId: string;
  email: string;
  vaultId: string;
  clientId: string;
  scopes: string[];
}): { token: string; jti: string; expiresAt: Date } {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET env var is not set");

  const jti = randomBytes(16).toString("hex");
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  const payload: McpTokenPayload = {
    sub: params.userId,
    email: params.email,
    vaultId: params.vaultId,
    jti,
    scope: params.scopes.join(" "),
    client_id: params.clientId,
    iat: now,
    exp: now + Math.floor(TOKEN_TTL_MS / 1000),
    iss: ISSUER,
  };

  return { token: sign(payload, secret), jti, expiresAt };
}

export function validateToken(token: string): McpTokenPayload | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const payload = verifyToken(token, secret);
  if (!payload) return null;
  // Type guard
  if (typeof payload.sub !== "string" || typeof payload.jti !== "string") return null;
  return payload as unknown as McpTokenPayload;
}

export function hasScope(token: McpTokenPayload, scope: string): boolean {
  return token.scope.split(" ").includes(scope);
}
