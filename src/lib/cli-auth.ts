import { randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";

const TOKEN_LENGTH = 32;
const DEFAULT_EXPIRY_DAYS = 30;

export function generateCliToken(): { plaintext: string; hash: string } {
  const plaintext = "kf1_" + randomBytes(TOKEN_LENGTH).toString("base64url");
  const hash = createHash("sha256").update(plaintext).digest("hex");
  return { plaintext, hash };
}

export function hashCliToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function validateCliToken(token: string): Promise<{ userId: string } | null> {
  if (!token.startsWith("kf1_")) return null;
  const hash = hashCliToken(token);
  const row = await db.cliToken.findUnique({
    where: { tokenHash: hash },
    select: { userId: true, expiresAt: true },
  });
  if (!row) return null;
  if (row.expiresAt < new Date()) {
    await db.cliToken.delete({ where: { tokenHash: hash } });
    return null;
  }
  return { userId: row.userId };
}

export async function createCliToken(userId: string, name: string) {
  const { plaintext, hash } = generateCliToken();
  const expiresAt = new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 86_400_000);
  await db.cliToken.create({
    data: { userId, name, tokenHash: hash, expiresAt },
  });
  return { token: plaintext, expiresAt };
}

export async function listCliTokens(userId: string) {
  return db.cliToken.findMany({
    where: { userId },
    select: { id: true, name: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeCliToken(userId: string, tokenId: string) {
  const { count } = await db.cliToken.deleteMany({
    where: { id: tokenId, userId },
  });
  return count > 0;
}
