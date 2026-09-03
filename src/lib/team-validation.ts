import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().trim().email("Correo inválido").toLowerCase(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export const memberRoleSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});
