// OAuth 2.0 Protected Resource Metadata (RFC 9728)
// mcp-remote looks here when it gets a WWW-Authenticate header without
// an explicit resource_metadata URL — links back to our auth server.

import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET() {
  return NextResponse.json({
    resource: BASE_URL,
    authorization_servers: [BASE_URL],
    scopes_supported: ["credentials:list", "credentials:read"],
    bearer_methods_supported: ["header"],
  });
}
