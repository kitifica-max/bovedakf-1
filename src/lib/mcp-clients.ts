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
    name: "Claude Code",
    description: "Anthropic's agentic coding tool",
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
    name: "Claude Desktop",
    description: "Anthropic's desktop application",
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
  return client.allowedRedirectUris.includes(redirectUri);
}

export function validateScopes(client: McpClient, scopes: string[]): boolean {
  return scopes.every((s) => client.allowedScopes.includes(s));
}

export const ALL_SCOPES = [
  "credentials:list",
  "credentials:read",
] as const;

export type Scope = (typeof ALL_SCOPES)[number];
