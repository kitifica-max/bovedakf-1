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
