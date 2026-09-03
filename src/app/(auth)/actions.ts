"use server";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { loginSchema, registerSchema } from "@/lib/validation";

export async function registerAction(_prev: string | null, formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
    industry: formData.get("industry"),
    bottleneck: formData.get("bottleneck"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  const { email, password, companyName, industry, bottleneck } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return "Ese email ya está registrado.";

  const { hash, salt } = hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      companyName,
      industry,
      bottleneck: bottleneck || null,
      passwordHash: hash,
      passwordSalt: salt,
    },
  });
  await db.vault.create({ data: { name: "Mi bóveda", ownerId: user.id } });

  return null;
}

// Checks credentials WITHOUT signing in — used by the login form to decide
// whether to show the TOTP step before actually calling signIn(). Only
// reveals totpRequired once the password itself is already confirmed
// correct, so it doesn't add an email-enumeration surface beyond what a
// normal login form already has.
export async function checkPasswordAction(
  formData: FormData
): Promise<{ ok: true; totpRequired: boolean } | { ok: false }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return { ok: false };

  const valid = verifyPassword(parsed.data.password, user.passwordHash, user.passwordSalt);
  if (!valid) return { ok: false };

  return { ok: true, totpRequired: user.totpEnabled };
}
