#!/usr/bin/env node
// Regression guard: every action in src/app/dashboard/actions.ts that
// touches a vaultId must call requireVaultAccess() before reading or writing
// vault data. Run as part of `npm run build` so a new action that forgets
// the gate fails the build instead of shipping — this is the app's only
// line of defense against cross-vault access (no Postgres Row Level
// Security backstop; see the 2026-09-04 security audit).
//
// Extend ALLOWLIST only for actions that prove vault access some other way
// (document the reason inline) — never to silence a real gap.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "app",
  "dashboard",
  "actions.ts"
);

const ALLOWLIST = {
  acceptInviteAction:
    "access is proven by the invite token + session email match, not prior membership — a first-time joiner has none yet",
  acceptInviteAsNewUserAction:
    "same as acceptInviteAction, for the not-yet-registered signup path",
  getAiAccessGrantsAction:
    "read-only: lists grants for a credential the user can already see in the dashboard — access is proven by dashboard session",
};

const src = readFileSync(FILE, "utf8");

// One chunk per exported function, signature line included.
const chunks = src
  .split(/(?=^export async function )/m)
  .filter((c) => c.startsWith("export async function"));

if (chunks.length === 0) {
  console.error(`✗ check-vault-authz: found no exported actions in ${FILE} — did it move?`);
  process.exit(1);
}

const offenders = [];
for (const chunk of chunks) {
  const name = chunk.match(/^export async function (\w+)/)?.[1];
  if (!name) continue;
  const touchesVaultId = /\bvaultId\b/.test(chunk);
  const gated = /requireVaultAccess\(/.test(chunk);
  if (touchesVaultId && !gated && !ALLOWLIST[name]) offenders.push(name);
}

if (offenders.length > 0) {
  console.error(
    `\n✗ check-vault-authz: ${offenders.length} action(s) touch vaultId without calling requireVaultAccess():\n` +
      offenders.map((n) => `  - ${n}`).join("\n") +
      `\n\nEvery vault-scoped server action must call requireVaultAccess(vaultId, minRole) before` +
      ` touching vault data — see src/lib/vault-access.ts. If this one genuinely proves access some` +
      ` other way, add it to ALLOWLIST in scripts/check-vault-authz.mjs with a one-line reason.\n`
  );
  process.exit(1);
}

console.log(
  `✓ check-vault-authz: ${chunks.length} action(s) checked, all vaultId-scoped ones call requireVaultAccess()`
);
