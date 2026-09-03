import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";

// Single-use, expiring tokens for email verification and password reset.
// Reuses the adapter's VerificationToken table; `identifier` is namespaced
// as "<kind>:<email>" so the two flows never collide.
type Kind = "verify" | "reset";

const TTL_MS: Record<Kind, number> = {
  verify: 24 * 60 * 60 * 1000,
  reset: 60 * 60 * 1000,
};

function idFor(kind: Kind, email: string) {
  return `${kind}:${email.toLowerCase()}`;
}

// Replaces any outstanding token of the same kind for this email.
export async function createToken(kind: Kind, email: string): Promise<string> {
  const identifier = idFor(kind, email);
  const token = randomBytes(32).toString("hex");
  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + TTL_MS[kind]) },
  });
  return token;
}

// Returns true and deletes the token on success; false if missing/expired.
export async function consumeToken(kind: Kind, email: string, token: string): Promise<boolean> {
  const identifier = idFor(kind, email);
  const row = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
  if (!row) return false;
  await db.verificationToken.deleteMany({ where: { identifier } });
  return row.expires > new Date();
}
