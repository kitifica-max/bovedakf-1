import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().trim().email("Correo inválido").toLowerCase(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export const memberRoleSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});

// Invitee signup: email comes from the invite, only a password is set.
export const inviteSignupSchema = z.object({
  password: z.string().min(10, "Mínimo 10 caracteres"),
});

// Plain module (not "use server") so it's safe to import from client
// components and server components alike.
export const ROLE_LABEL: Record<"OWNER" | "EDITOR" | "VIEWER", string> = {
  OWNER: "Dueño",
  EDITOR: "Editor",
  VIEWER: "Lector",
};
