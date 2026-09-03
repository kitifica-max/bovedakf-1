// RFC 6238 TOTP (Google Authenticator / Authy compatible) — no external TOTP
// lib needed, it's ~60 lines of HMAC-SHA1 truncation over Node's own crypto.
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { verifyPassword } from "@/lib/crypto";

const STEP_SECONDS = 30;
const DIGITS = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // RFC 4648 base32

function base32Encode(buf: Buffer): string {
  let bits = "";
  for (const byte of buf) bits += byte.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  const rem = bits.length % 5;
  if (rem > 0) {
    const chunk = bits.slice(bits.length - rem).padEnd(5, "0");
    out += ALPHABET[parseInt(chunk, 2)];
  }
  return out;
}

function base32Decode(str: string): Buffer {
  const clean = str.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** DIGITS).toString().padStart(DIGITS, "0");
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpAuthUrl(secretBase32: string, email: string, issuer = "Bóveda KF-1"): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

// Accepts codes from one step behind/ahead to tolerate clock drift.
export function verifyTotp(secretBase32: string, code: string, window = 1): boolean {
  const cleaned = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  for (let i = -window; i <= window; i++) {
    const expected = hotp(secret, counter + i);
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(cleaned))) return true;
  }
  return false;
}

// Recovery codes for when the authenticator device is lost. Shown once at
// enrollment; only their hash is stored.
export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const part = () => randomInt(0, 36 ** 4).toString(36).toUpperCase().padStart(4, "0");
    return `${part()}-${part()}`;
  });
}

export type BackupCode = { hash: string; salt: string; usedAt: string | null };

// Index of the first unused code matching `candidate`, or -1. Caller is
// responsible for persisting the resulting usedAt stamp.
export function matchBackupCode(codes: BackupCode[], candidate: string): number {
  const clean = candidate.trim().toUpperCase();
  if (!clean) return -1;
  return codes.findIndex((c) => !c.usedAt && verifyPassword(clean, c.hash, c.salt));
}
