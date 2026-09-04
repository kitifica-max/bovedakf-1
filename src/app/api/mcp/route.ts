// MCP Server endpoint — handles JSON-RPC 2.0 messages.
// Validates Bearer token, routes to tool handlers, returns results.
//
// Tools:
//   tools/list       → lists credentials with AI access enabled
//   tools/call        → routes to individual tool handlers
//
// The agent NEVER receives the secret in plaintext. It receives a secure
// link (same pattern as share links) that it can fetch and decrypt locally.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { anonymizeIp } from "@/lib/audit";
import { decryptAtRest, encryptForLink, generateLinkKey, generatePublicId } from "@/lib/crypto";
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
      "List credentials in a vault that have AI access enabled. Returns service names and IDs only — never secrets.",
    inputSchema: {
      type: "object",
      properties: {
        vaultId: { type: "string", description: "The vault ID to list credentials from" },
      },
      required: ["vaultId"],
    },
  },
  {
    name: "request_credential",
    description:
      "Request temporary access to a specific credential. Returns a secure link that expires. The secret is never included in the response — the link must be fetched and decrypted separately.",
    inputSchema: {
      type: "object",
      properties: {
        vaultId: { type: "string", description: "The vault ID" },
        credentialId: { type: "string", description: "The credential ID to request access to" },
        durationMinutes: {
          type: "number",
          description: "Access duration in minutes (max determined by policy)",
          minimum: 1,
          maximum: 240,
        },
      },
      required: ["vaultId", "credentialId"],
    },
  },
];

// ── Tool handlers ────────────────────────────────────────────────────────

async function handleListCredentials(token: McpTokenPayload, vaultId: string) {
  // Verify the token is scoped to this vault
  if (token.vaultId !== vaultId) {
    return { error: "Token not authorized for this vault" };
  }

  const policies = await db.aIAccessPolicy.findMany({
    where: { enabled: true, credential: { vaultId } },
    include: { credential: { select: { id: true, service: true, username: true } } },
  });

  return {
    credentials: policies.map((p) => ({
      id: p.credential.id,
      service: p.credential.service,
      username: p.credential.username,
      maxDurationMin: p.maxDurationMin,
    })),
  };
}

async function handleRequestCredential(
  token: McpTokenPayload,
  vaultId: string,
  credentialId: string,
  durationMinutes?: number
) {
  // 1. Verify vault access
  if (token.vaultId !== vaultId) {
    return { error: "Token not authorized for this vault" };
  }

  // 2. Verify AI access policy
  const policy = await db.aIAccessPolicy.findUnique({
    where: { credentialId },
    include: { credential: { select: { id: true, service: true, username: true, vaultId: true, encryptedData: true } } },
  });

  if (!policy || !policy.enabled) {
    return { error: "AI access not enabled for this credential" };
  }

  if (policy.credential.vaultId !== vaultId) {
    return { error: "Credential not found in this vault" };
  }

  // 3. Validate duration
  const requestedDuration = Math.min(durationMinutes ?? policy.maxDurationMin, policy.maxDurationMin);
  if (requestedDuration < 1 || requestedDuration > policy.maxDurationMin) {
    return { error: `Duration must be between 1 and ${policy.maxDurationMin} minutes` };
  }

  // 4. Decrypt credential and re-encrypt with one-time key (same as share links)
  const plaintext = JSON.stringify({
    service: policy.credential.service,
    username: policy.credential.username,
    ...JSON.parse(decryptAtRest(policy.credential.encryptedData)),
  });

  const linkKey = generateLinkKey();
  const publicId = generatePublicId();

  // 5. Store encrypted grant
  const expiresAt = new Date(Date.now() + requestedDuration * 60 * 1000);

  const grant = await db.aIAccessGrant.create({
    data: {
      policyId: policy.id,
      credentialId,
      vaultId,
      publicId,
      payload: encryptForLink(plaintext, linkKey),
      permission: "READ",
      agentName: token.client_id,
      grantedByUserId: token.sub,
      expiresAt,
    },
  });

  // 6. Audit log
  await db.auditLog.create({
    data: {
      vaultId,
      aiGrantId: grant.id,
      action: "ai_access_granted",
      actorEmail: token.email,
      credentialService: policy.credential.service,
      agentName: token.client_id,
    },
  });

  // 7. Return secure link — the key is in the fragment, never in the JSON body
  //    that could be logged or intercepted by the LLM context.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/s/${publicId}#k=${linkKey.toString("base64url")}`;

  return {
    url,
    expiresAt: expiresAt.toISOString(),
    credential: {
      service: policy.credential.service,
      username: policy.credential.username,
    },
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

        if (toolName === "request_credential") {
          if (!hasScope(token, "credentials:request")) {
            return jsonrpcError(id, -32003, "Insufficient scope: credentials:request required");
          }
          const vaultId = toolArgs.vaultId as string;
          const credentialId = toolArgs.credentialId as string;
          const durationMinutes = toolArgs.durationMinutes as number | undefined;
          if (!vaultId || !credentialId) return jsonrpcError(id, -32602, "Missing vaultId or credentialId");
          const result = await handleRequestCredential(token, vaultId, credentialId, durationMinutes);
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
