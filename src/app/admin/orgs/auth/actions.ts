"use server";

import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";

export async function sudoOrgsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.email)) redirect("/dashboard");

  const password = (formData.get("password") as string | null)?.trim() ?? "";
  if (!password) return { error: "Contraseña requerida." };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true, passwordSalt: true },
  });

  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    return { error: "Contraseña incorrecta." };
  }

  const exp = Date.now() + 15 * 60 * 1000;
  const payload = `${session.user.id}:${exp}`;
  const sig = createHmac("sha256", process.env.AUTH_SECRET!).update(payload).digest("hex");

  (await cookies()).set("kf1_sudo_orgs", `${payload}:${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/admin/orgs",
  });

  redirect("/admin/orgs");
}
