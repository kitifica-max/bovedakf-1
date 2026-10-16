"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";
import { changePasswordSchema, deleteAccountSchema } from "@/lib/validation";

// Both actions re-check the current password, so a stolen session alone can't change or delete the account.
// ponytail: JWT sessions on other devices stay valid until they expire; add a session version if that matters.

export async function changePasswordAction(formData: FormData): Promise<{ error: string } | { error: null }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  if (!(await rateLimit(`pw-change:${session.user.id}`, 5)).success) {
    return { error: "Demasiados intentos. Esperá un minuto e intentá de nuevo." };
  }

  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current") ?? "",
    next: formData.get("next") ?? "",
    confirm: formData.get("confirm") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !verifyPassword(parsed.data.current, user.passwordHash, user.passwordSalt)) {
    return { error: "La contraseña actual no es correcta" };
  }

  const { hash, salt } = hashPassword(parsed.data.next);
  await db.user.update({ where: { id: user.id }, data: { passwordHash: hash, passwordSalt: salt } });
  return { error: null };
}

export async function deleteAccountAction(formData: FormData): Promise<{ error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  if (!(await rateLimit(`account-delete:${session.user.id}`, 5)).success) {
    return { error: "Demasiados intentos. Esperá un minuto e intentá de nuevo." };
  }

  const parsed = deleteAccountSchema.safeParse({
    password: formData.get("password") ?? "",
    confirmEmail: formData.get("confirmEmail") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, passwordHash: true, passwordSalt: true, orgRole: true, subscription: { select: { status: true } } },
  });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash, user.passwordSalt)) {
    return { error: "La contraseña no es correcta" };
  }
  if (parsed.data.confirmEmail !== user.email.toLowerCase()) {
    return { error: "El email no coincide con el de tu cuenta" };
  }
  // A recurring Wompi charge would keep billing a deleted account.
  if (user.subscription?.status === "ACTIVE") {
    return { error: "Tenés un plan mensual activo. Cancelalo en panel.wompi.sv/Recurrentes y después eliminá la cuenta." };
  }
  if (user.orgRole === "OWNER") {
    return { error: "Sos dueño de una organización. Pasale ese rol a otra persona antes de eliminar tu cuenta." };
  }

  // Cascades (schema onDelete): owned clients with their accounts, links and audit, memberships,
  // invites, passkeys, CLI tokens and purchases.
  await db.user.delete({ where: { id: user.id } });
  revalidatePath("/", "layout");
  await signOut({ redirectTo: "/?cuenta=eliminada" });
  return { error: "" };
}
