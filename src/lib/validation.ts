import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingresá un correo electrónico válido"),
  password: z.string().min(10, "Mínimo 10 caracteres"),
  companyName: z.string().trim().min(1, "Nombre de empresa requerido").max(120, "Máximo 120 caracteres"),
  industry: z.string().trim().min(1, "Elegí un rubro").max(80),
  bottleneck: z.string().trim().max(500).optional().or(z.literal("")),
  currentSolution: z.string().trim().max(500).optional().or(z.literal("")),
});

export const updateCompanyNameSchema = z.object({
  companyName: z.string().trim().min(1, "Nombre de empresa requerido").max(120),
});

export const dashboardSurveySchema = z.object({
  answer: z.string().trim().min(1).max(500),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const emailSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(10, "Mínimo 10 caracteres"),
});

export const totpCodeSchema = z.object({
  code: z.string().trim().min(6, "Código inválido").max(20),
});

export const credentialSchema = z.object({
  vaultId: z.string().min(1, "Bóveda requerida"),
  service: z.string().min(1, "Nombre del servicio requerido").max(120),
  username: z.string().min(1, "Usuario requerido").max(200),
  secret: z.string().min(1, "Contraseña o secreto requerido"),
  notes: z.string().max(2000).optional(),
});

export const shareLinkSchema = z.object({
  credentialId: z.string().min(1, "Credencial requerida"),
  permission: z.enum(["READ", "DOWNLOAD"], { message: "Permiso inválido" }),
  expiresInHours: z.coerce.number({ message: "Expiración requerida" }).int().min(1).max(168), // 1h – 7d
});
