import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10, "Mínimo 10 caracteres"),
});

export const credentialSchema = z.object({
  vaultId: z.string().min(1),
  service: z.string().min(1).max(120),
  username: z.string().min(1).max(200),
  secret: z.string().min(1),
  notes: z.string().max(2000).optional(),
});

export const shareLinkSchema = z.object({
  credentialId: z.string().min(1),
  permission: z.enum(["READ", "DOWNLOAD"]),
  expiresInHours: z.coerce.number().int().min(1).max(168), // 1h – 7d
});
