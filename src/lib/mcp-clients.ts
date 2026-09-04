// Static MCP client registry. KF-1 is not an open platform — only
// pre-approved clients can obtain OAuth tokens. Each client has a fixed
// client_id and a set of allowed redirect URIs.

export type McpClient = {
  clientId: string;
  name: string;
  description: string;
  allowedRedirectUris: string[];
  allowedScopes: string[];
};

const CLIENTS: Record<string, McpClient> = {
  "claude-code": {
    clientId: "claude-code",
    name: "KF-1",
    description: "Bóveda KF-1 — credential vault for AI agents",
    allowedRedirectUris: [
      "http://localhost:3000/callback",
      "http://127.0.0.1:3000/callback",
    ],
    allowedScopes: [
      "credentials:list",
      "credentials:read",
    ],
  },
  "claude-desktop": {
    clientId: "claude-desktop",
    name: "KF-1",
    description: "Bóveda KF-1 — credential vault for AI agents",
    allowedRedirectUris: [
      "http://localhost:3000/callback",
      "http://127.0.0.1:3000/callback",
    ],
    allowedScopes: [
      "credentials:list",
      "credentials:read",
    ],
  },
};

export function getClient(clientId: string): McpClient | null {
  return CLIENTS[clientId] ?? null;
}

export function validateRedirectUri(client: McpClient, redirectUri: string): boolean {
  if (client.allowedRedirectUris.includes(redirectUri)) return true;
  // mcp-remote uses a dynamic port derived from the server URL — allow any localhost port
  try {
    const { hostname, pathname } = new URL(redirectUri);
    if ((hostname === "localhost" || hostname === "127.0.0.1") && pathname === "/callback") return true;
  } catch { /* fall through */ }
  return false;
}

export function validateScopes(client: McpClient, scopes: string[]): boolean {
  return scopes.every((s) => client.allowedScopes.includes(s));
}

export const ALL_SCOPES = [
  "credentials:list",
  "credentials:read",
] as const;

export type Scope = (typeof ALL_SCOPES)[number];
