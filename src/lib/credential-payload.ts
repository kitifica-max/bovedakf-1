import { decryptAtRest, encryptAtRest } from "@/lib/crypto";
import type { SharedTotp } from "@/lib/totp";

// Shape of Credential.encryptedData once decrypted.
type Payload = { secret: string; notes?: string; totp?: SharedTotp };

const read = (encrypted: string) => JSON.parse(decryptAtRest(encrypted)) as Payload;

export const writePayload = (p: Payload) => encryptAtRest(JSON.stringify(p));

// What may leave the server (reveal, share links, extension, AI): never the 2FA seed —
// only its current code, so removing someone from a vault also ends their 2FA access.
export function readShareable(encrypted: string) {
  const { secret, notes } = read(encrypted);
  return { secret, notes: notes ?? "" };
}

export const readTotp = (encrypted: string) => read(encrypted).totp ?? null;

export const withTotp = (encrypted: string, totp: SharedTotp) => writePayload({ ...read(encrypted), totp });

// Partial update of the encrypted payload: only the given fields change; `totp: null` removes the 2FA seed.
export function patchPayload(encrypted: string, patch: { secret?: string; notes?: string; totp?: null }) {
  const current = read(encrypted);
  const next = { ...current };
  if (patch.secret) next.secret = patch.secret;
  if (patch.notes !== undefined) next.notes = patch.notes;
  if (patch.totp === null) delete next.totp;
  return writePayload(next);
}
