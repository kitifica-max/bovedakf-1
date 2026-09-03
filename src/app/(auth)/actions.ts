"use server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { registerSchema } from "@/lib/validation";

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
