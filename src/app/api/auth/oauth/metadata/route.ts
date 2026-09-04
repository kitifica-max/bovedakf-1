// OAuth 2.0 Authorization Server Metadata (RFC 8414)
// MCP clients use this to discover auth endpoints.

import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET() {
  return NextResponse.json({
    issuer: BASE_URL,
    authorization_endpoint: `${BASE_URL}/api/auth/oauth/authorize`,
    token_endpoint: `${BASE_URL}/api/auth/oauth/token`,
    registration_endpoint: `${BASE_URL}/api/auth/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["credentials:list", "credentials:read"],
  });
}
