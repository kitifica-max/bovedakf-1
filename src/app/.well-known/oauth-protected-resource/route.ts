// Direct route for RFC 9728 Protected Resource Metadata.
// Served at /.well-known/oauth-protected-resource in addition to the
// rewrite in next.config.ts, so mcp-remote can always discover our auth
// servers regardless of Netlify's rewrite handling.

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
