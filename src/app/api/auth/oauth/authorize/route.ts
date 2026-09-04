// OAuth 2.1 Authorization endpoint.
// Redirects unauthenticated users to login, then shows an authorization
// consent screen. On approval, redirects back with an authorization code.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "node:crypto";
import { getClient, validateRedirectUri, validateScopes } from "@/lib/mcp-clients";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const AUTH_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope");
  const state = searchParams.get("state");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");
  const vaultId = searchParams.get("vault_id");

  // Validate required params
  if (!clientId || !redirectUri || !scope || !state || !codeChallenge) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  // Validate client
  const client = getClient(clientId);
  if (!client) {
    return NextResponse.json({ error: "Unknown client_id" }, { status: 400 });
  }

  // Validate redirect URI
  if (!validateRedirectUri(client, redirectUri)) {
    return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  // Validate PKCE
  if (codeChallengeMethod !== "S256") {
    return NextResponse.json({ error: "code_challenge_method must be S256" }, { status: 400 });
  }

  // Validate scopes
  const scopes = scope.split(" ");
  if (!validateScopes(client, scopes)) {
    return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
  }

  // Check authentication
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    // If the client expects JSON (e.g. mcp-remote validating the endpoint
    // server-side), return a JSON error instead of a redirect — mcp-remote
    // can't parse HTML and will crash with "[object Response]".
    const accept = req.headers.get("accept") ?? "";
    if (accept.includes("application/json")) {
      return NextResponse.json(
        { error: "login_required", error_description: "User must log in to authorize" },
        { status: 401 }
      );
    }
    // Browser-based flow: redirect to login with return URL
    const loginUrl = new URL("/login", BASE_URL);
    loginUrl.searchParams.set("from", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Resolve vault: use provided vault_id or auto-select the user's first vault
  let resolvedVaultId = vaultId;
  if (!resolvedVaultId) {
    const firstVault = await db.vault.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    if (!firstVault) {
      return NextResponse.json({ error: "No vault found for this account" }, { status: 403 });
    }
    resolvedVaultId = firstVault.id;
  } else {
    const { getVaultRole } = await import("@/lib/vault-access");
    const role = await getVaultRole(resolvedVaultId, session.user.id);
    if (!role) {
      return NextResponse.json({ error: "You do not have access to this vault" }, { status: 403 });
    }
  }

  // Store authorization params in a short-lived cookie for the consent screen
  const authParams = {
    clientId,
    redirectUri,
    scope,
    state,
    codeChallenge,
    vaultId: resolvedVaultId,
    userId: session.user.id,
    email: session.user.email,
  };

  // Generate a consent token (short-lived, single-use)
  const consentToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + AUTH_CODE_TTL_MS);

  // Store in VerificationToken table (reuse existing table)
  await db.verificationToken.create({
    data: {
      identifier: `mcp-consent:${consentToken}`,
      token: JSON.stringify(authParams),
      expires,
    },
  });

  // Redirect to consent page
  const consentUrl = new URL("/dashboard/ai-access/consent", BASE_URL);
  consentUrl.searchParams.set("token", consentToken);
  consentUrl.searchParams.set("client_id", clientId);
  consentUrl.searchParams.set("vault_id", resolvedVaultId);
  return NextResponse.redirect(consentUrl);
}
