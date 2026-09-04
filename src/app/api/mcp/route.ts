// MCP Server endpoint — handles JSON-RPC 2.0 messages.
// Validates Bearer token, routes to tool handlers, returns results.
//
// Tools:
//   tools/list       → lists credentials with aiAccessible=true in a vault
//   tools/call        → routes to individual tool handlers
//
// The agent receives decrypted credentials directly (the agent IS an
// authenticated user with a scoped session). No temporary links or
// re-encryption — just standard decryptAtRest.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { anonymizeIp } from "@/lib/audit";
import { decryptAtRest } from "@/lib/crypto";
import { validateToken, hasScope, type McpTokenPayload } from "@/lib/mcp-auth";

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate, private" };

// ── JSON-RPC helpers ─────────────────────────────────────────────────────

function jsonrpcOk(id: number | string, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result }, { headers: NO_STORE });
}

function jsonrpcError(id: number | string | null, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { headers: NO_STORE });
}

// ── Tool definitions ─────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "list_credentials",
    description:
      "List credentials in a vault that are available for AI access. Returns service names and IDs only.",
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
      "Get a credential's details including the decrypted secret. Only works for credentials with AI access enabled.",
    inputSchema: {
      type: "object",
      properties: {
        vaultId: { type: "string", description: "The vault ID" },
        credentialId: { type: "string", description: "The credential ID to retrieve" },
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
  });

  if (!credential) {
    return { error: "Credential not found or AI access not enabled" };
  }

  const decrypted = JSON.parse(decryptAtRest(credential.encryptedData));

  // Audit log
  await db.auditLog.create({
    data: {
      vaultId,
      action: "ai_credential_accessed",
      credentialService: credential.service,
      agentName: token.client_id,
      actorEmail: token.email,
    },
  });

  return {
    id: credential.id,
    service: credential.service,
    username: credential.username,
    secret: decrypted.secret,
    notes: decrypted.notes || undefined,
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

  // Validate Bearer token
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Missing or invalid authorization" } },
      { status: 401, headers: NO_STORE }
    );
  }

  const token = validateToken(auth.slice(7));
  if (!token) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Invalid or expired token" } },
      { status: 401, headers: NO_STORE }
    );
  }

  // Parse JSON-RPC request
  let body: { method?: string; params?: Record<string, unknown>; id?: number | string };
  try {
    body = await req.json();
  } catch {
    return jsonrpcError(null, -32700, "Parse error");
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

// MCP servers respond to POST only
export async function GET() {
  return NextResponse.json(
    { error: "MCP server requires POST with JSON-RPC 2.0" },
    { status: 405, headers: NO_STORE }
  );
}
