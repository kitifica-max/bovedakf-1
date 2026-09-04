// RFC 7591 — OAuth 2.0 Dynamic Client Registration.
// mcp-remote requires this before starting the OAuth flow.
// We only allow localhost/127.0.0.1 redirect URIs (public PKCE clients).
// All localhost clients map to the "claude-code" static client_id.

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { redirect_uris?: string[]; client_name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_client_metadata" }, { status: 400 });
  }

  const { redirect_uris = [] } = body;

  if (redirect_uris.length === 0) {
    return NextResponse.json({ error: "invalid_redirect_uri", error_description: "redirect_uris is required" }, { status: 400 });
  }

  // Only localhost/127.0.0.1 — no arbitrary redirect URIs
  for (const uri of redirect_uris) {
    try {
      const { hostname } = new URL(uri);
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        return NextResponse.json({ error: "invalid_redirect_uri", error_description: "Only localhost redirect URIs are supported" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400 });
    }
  }

  return NextResponse.json({
    client_id: "claude-code",
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris,
    grant_types: ["authorization_code"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    scope: "credentials:list credentials:read",
  }, { status: 201 });
}
