// OAuth 2.1 Token endpoint.
// Exchanges authorization code + PKCE code_verifier for access token.
// Uses authorization_code grant with PKCE (S256).

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "node:crypto";
import { getClient, validateRedirectUri } from "@/lib/mcp-clients";
import { generateToken } from "@/lib/mcp-auth";

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate, private" };

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    // Try form-urlencoded
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text));
  }

  const { grant_type, code, redirect_uri, client_id, code_verifier } = body;

  // Validate grant type
  if (grant_type !== "authorization_code") {
    return NextResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400, headers: NO_STORE }
    );
  }

  // Validate required params
  if (!code || !redirect_uri || !client_id || !code_verifier) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing required parameters" },
      { status: 400, headers: NO_STORE }
    );
  }

  // Validate client
  const client = getClient(client_id);
  if (!client) {
    return NextResponse.json(
      { error: "invalid_client", error_description: "Unknown client_id" },
      { status: 401, headers: NO_STORE }
    );
  }

  // Validate redirect URI
  if (!validateRedirectUri(client, redirect_uri)) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Invalid redirect_uri" },
      { status: 400, headers: NO_STORE }
    );
  }

  // Look up the consent record
  const consentRecord = await db.verificationToken.findFirst({
    where: { identifier: `mcp-consent:${code}` },
  });

  if (!consentRecord) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Invalid or expired authorization code" },
      { status: 400, headers: NO_STORE }
    );
  }

  // Check expiry
  if (consentRecord.expires < new Date()) {
    await db.verificationToken.deleteMany({ where: { identifier: `mcp-consent:${code}` } });
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Authorization code expired" },
      { status: 400, headers: NO_STORE }
    );
  }

  // Parse and validate stored params
  let authParams: {
    clientId: string;
    redirectUri: string;
    scope: string;
    state: string;
    codeChallenge: string;
    vaultId: string;
    userId: string;
    email: string;
  };
  try {
    authParams = JSON.parse(consentRecord.token);
  } catch {
    await db.verificationToken.deleteMany({ where: { identifier: `mcp-consent:${code}` } });
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Corrupted authorization data" },
      { status: 400, headers: NO_STORE }
    );
  }

  // Verify client matches
  if (authParams.clientId !== client_id) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Client mismatch" },
      { status: 400, headers: NO_STORE }
    );
  }

  // Verify redirect URI matches
  if (authParams.redirectUri !== redirect_uri) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Redirect URI mismatch" },
      { status: 400, headers: NO_STORE }
    );
  }

  // Verify PKCE (S256)
  const computedChallenge = createHash("sha256")
    .update(code_verifier)
    .digest("base64url");
  if (computedChallenge !== authParams.codeChallenge) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "PKCE verification failed" },
      { status: 400, headers: NO_STORE }
    );
  }

  // Delete the consent record (single-use)
  await db.verificationToken.deleteMany({ where: { identifier: `mcp-consent:${code}` } });

  // Generate access token
  const scopes = authParams.scope.split(" ");
  const { token, jti, expiresAt } = generateToken({
    userId: authParams.userId,
    email: authParams.email,
    vaultId: authParams.vaultId,
    clientId: client_id,
    scopes,
  });

  return NextResponse.json(
    {
      access_token: token,
      token_type: "Bearer",
      expires_in: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      scope: authParams.scope,
      jti,
    },
    { headers: NO_STORE }
  );
}
