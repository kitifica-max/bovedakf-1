import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const stored = Buffer.from(hash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

// AES-256-GCM, output = base64(iv[12] + authTag[16] + ciphertext).
function aesEncrypt(plaintext: string, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

function aesDecrypt(payload: string, key: Buffer) {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

// Server-held key used to encrypt credentials at rest.
function serverKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) throw new Error("ENCRYPTION_KEY env var is not set");
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  return key;
}

export function encryptAtRest(plaintext: string) {
  return aesEncrypt(plaintext, serverKey());
}

export function decryptAtRest(payload: string) {
  return aesDecrypt(payload, serverKey());
}

// One-time key for a share link. Returned to the caller once — the caller
// puts it in the URL fragment and never persists it server-side.
export function generateLinkKey() {
  return randomBytes(32);
}

export function encryptForLink(plaintext: string, key: Buffer) {
  return aesEncrypt(plaintext, key);
}

export function decryptForLink(payload: string, key: Buffer) {
  return aesDecrypt(payload, key);
}

export function generatePublicId() {
  return randomBytes(24).toString("base64url");
}
