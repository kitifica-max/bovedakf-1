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

// Returns whether the token is valid.
// - "reset": strictly single-use — deleted on any match (valid or expired).
// - "verify": stays usable within its TTL. Email clients and security
//   scanners prefetch links, which would burn a single-use token before
//   the user ever clicks; a reusable-until-expiry token also makes repeat
//   clicks idempotent. Only cleaned up once expired.
export async function consumeToken(kind: Kind, email: string, token: string): Promise<boolean> {
  const identifier = idFor(kind, email);
  const row = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
  if (!row) return false;
  const valid = row.expires > new Date();
  if (kind === "reset" || !valid) {
    await db.verificationToken.deleteMany({ where: { identifier } });
  }
  return valid;
}
