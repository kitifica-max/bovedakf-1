import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().trim().email("Correo inválido").toLowerCase(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export const memberRoleSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});

// Plain module (not "use server") so it's safe to import from client
// components and server components alike.
export const ROLE_LABEL: Record<"OWNER" | "EDITOR" | "VIEWER", string> = {
  OWNER: "Dueño",
  EDITOR: "Editor",
  VIEWER: "Lector",
};
