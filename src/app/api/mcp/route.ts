// MCP Server endpoint — handles JSON-RPC 2.0 messages.
// Validates Bearer token, routes to tool handlers, returns results.
//
// Tools:
//   tools/list       → lists credentials with aiAccessible=true in a vault
//   tools/call        → routes to individual tool handlers
//
// The agent NEVER receives the secret in plaintext. It receives a secure
// link (same pattern as share links) that the user can open in their
// browser to view the credential. The decryption key lives only in the
// URL fragment — it never touches the server or the LLM context.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { anonymizeIp } from "@/lib/audit";
import { decryptAtRest, encryptForLink, generateLinkKey, generatePublicId } from "@/lib/crypto";
import { validateToken, hasScope, type McpTokenPayload } from "@/lib/mcp-auth";

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate, private" };
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
// Sent on every 401 so mcp-remote can discover the OAuth server (RFC 9728 / RFC 8414).
const WWW_AUTH = `Bearer realm="${BASE_URL}", resource_metadata="${BASE_URL}/.well-known/oauth-protected-resource"`;

// ── JSON-RPC helpers ─────────────────────────────────────────────────────

function jsonrpcOk(id: number | string, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result }, { headers: NO_STORE });
}

function jsonrpcError(id: number | string | null, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { headers: NO_STORE });
}

// Supported protocol versions — respond with the client's preferred version
// if we support it, otherwise fall back to the oldest supported version.
const SUPPORTED_PROTOCOL_VERSIONS = ["2025-03-26", "2024-11-05"];
const DEFAULT_PROTOCOL_VERSION = "2024-11-05";

// ── Tool definitions ─────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "list_credentials",
    description:
      "List credentials in a vault that are available for AI access. Returns service names and IDs only — never secrets.",
    inputSchema: {
      type: "object",
      properties: {
        vaultId: { type: "string", description: "The vault ID to list credentials from" },
      },
      required: ["vaultId"],
    },
  },
  {
    name: "get_credential",
    description:
      "Get a secure link to view a credential. The link expires in 15 minutes. The secret is never included in the response — the user must open the link in their browser.",
    inputSchema: {
      type: "object",
      properties: {
        vaultId: { type: "string", description: "The vault ID" },
        credentialId: { type: "string", description: "The credential ID to get a link for" },
      },
      required: ["vaultId", "credentialId"],
    },
  },
];

// ── Tool handlers ────────────────────────────────────────────────────────

async function handleListCredentials(token: McpTokenPayload, vaultId: string) {
  if (token.vaultId !== vaultId) {
    return { error: "Token not authorized for this vault" };
  }

  const credentials = await db.credential.findMany({
    where: { vaultId, aiAccessible: true },
    select: { id: true, service: true, username: true },
    orderBy: { service: "asc" },
  });

  return { credentials };
}

async function handleGetCredential(token: McpTokenPayload, vaultId: string, credentialId: string) {
  if (token.vaultId !== vaultId) {
    return { error: "Token not authorized for this vault" };
  }

  const credential = await db.credential.findFirst({
    where: { id: credentialId, vaultId, aiAccessible: true },
    select: { id: true, service: true, username: true, encryptedData: true },
  });

  if (!credential) {
    return { error: "Credential not found or AI access not enabled" };
  }

  // Decrypt and re-encrypt with a one-time key (same pattern as share links)
  const plaintext = JSON.stringify({
    service: credential.service,
    username: credential.username,
    ...JSON.parse(decryptAtRest(credential.encryptedData)),
  });

  const linkKey = generateLinkKey();
  const publicId = generatePublicId();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.shareLink.create({
    data: {
      publicId,
      credentialId,
      permission: "READ",
      payload: encryptForLink(plaintext, linkKey),
      expiresAt,
    },
  });

  // Audit log
  await db.auditLog.create({
    data: {
      vaultId,
      action: "ai_link_created",
      shareLinkId: (await db.shareLink.findFirst({ where: { publicId }, select: { id: true } }))?.id,
      credentialService: credential.service,
      agentName: token.client_id,
      actorEmail: token.email,
    },
  });

  // Return secure link — the key is in the fragment, never in the JSON body
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/s/${publicId}#k=${linkKey.toString("base64url")}`;

  return {
    url,
    expiresAt: expiresAt.toISOString(),
    credential: {
      service: credential.service,
      username: credential.username,
    },
    note: "Share this link with the user. The secret is only visible when they open it in their browser.",
  };
}

// ── Main handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawIp = clientIp(req.headers);
  const ip = anonymizeIp(rawIp);

  // Rate limit: 30 req/min per IP
  const { success } = await rateLimit(`mcp:${rawIp}`, 30);
  if (!success) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32099, message: "Rate limit exceeded" } },
      { status: 429, headers: NO_STORE }
    );
  }

  // Parse body early so we can handle initialize without auth (MCP handshake).
  let body: { method?: string; params?: Record<string, unknown>; id?: number | string };
  try {
    body = await req.json();
  } catch {
    return jsonrpcError(null, -32700, "Parse error");
  }

  // MCP protocol handshake — allow without auth so mcp-remote can complete
  // the initialize round-trip before triggering OAuth discovery.
  if (body.method === "initialize") {
    // Negotiate protocol version: use client's preferred version if supported
    const clientVersion = body.params?.protocolVersion as string | undefined;
    const protocolVersion =
      clientVersion && SUPPORTED_PROTOCOL_VERSIONS.includes(clientVersion)
        ? clientVersion
        : DEFAULT_PROTOCOL_VERSION;

    return jsonrpcOk(body.id ?? 0, {
      protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: "KF-1 Vault", version: "1.0.0" },
    });
  }
  if (body.method === "notifications/initialized") {
    // Return 200 with empty JSON object — some MCP clients treat 204 as an error
    return NextResponse.json({}, { status: 200, headers: NO_STORE });
  }

  // All other methods require a valid Bearer token.
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Missing or invalid authorization" } },
      { status: 401, headers: { ...NO_STORE, "WWW-Authenticate": WWW_AUTH } }
    );
  }

  const token = validateToken(auth.slice(7));
  if (!token) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Invalid or expired token" } },
      { status: 401, headers: { ...NO_STORE, "WWW-Authenticate": WWW_AUTH } }
    );
  }

  const { method, params, id } = body;

  if (typeof id === "undefined") {
    return jsonrpcError(null, -32600, "Missing request id");
  }

  try {
    switch (method) {
      case "tools/list":
        return jsonrpcOk(id, { tools: TOOLS });

      case "tools/call": {
        const toolName = params?.name as string;
        const toolArgs = (params?.arguments as Record<string, unknown>) ?? {};

        if (toolName === "list_credentials") {
          if (!hasScope(token, "credentials:list")) {
            return jsonrpcError(id, -32003, "Insufficient scope: credentials:list required");
          }
          const vaultId = toolArgs.vaultId as string;
          if (!vaultId) return jsonrpcError(id, -32602, "Missing vaultId");
          const result = await handleListCredentials(token, vaultId);
          return jsonrpcOk(id, result);
        }

        if (toolName === "get_credential") {
          if (!hasScope(token, "credentials:read")) {
            return jsonrpcError(id, -32003, "Insufficient scope: credentials:read required");
          }
          const vaultId = toolArgs.vaultId as string;
          const credentialId = toolArgs.credentialId as string;
          if (!vaultId || !credentialId) return jsonrpcError(id, -32602, "Missing vaultId or credentialId");
          const result = await handleGetCredential(token, vaultId, credentialId);
          return jsonrpcOk(id, result);
        }

        return jsonrpcError(id, -32601, `Unknown tool: ${toolName}`);
      }

      default:
        return jsonrpcError(id, -32601, `Unknown method: ${method}`);
    }
  } catch (err) {
    console.error("[mcp] error", err);
    return jsonrpcError(id ?? null, -32603, "Internal error");
  }
}

// MCP servers respond to POST only — but return 401 with WWW-Authenticate
// so mcp-remote can discover the OAuth server (it probes with GET at startup).
export async function GET() {
  return NextResponse.json(
    { jsonrpc: "2.0", id: null, error: { code: -32600, message: "MCP server requires POST with JSON-RPC 2.0" } },
    { status: 401, headers: { ...NO_STORE, "WWW-Authenticate": WWW_AUTH } }
  );
}
