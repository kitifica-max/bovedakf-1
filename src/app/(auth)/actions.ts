"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, burnPasswordCompare } from "@/lib/crypto";
import { loginSchema, registerSchema, emailSchema, resetPasswordSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createToken, consumeToken } from "@/lib/tokens";
import { applyMembership } from "@/lib/vault-access";
import {
  sendEmail,
  verificationEmail,
  passwordResetEmail,
  duplicateSignupEmail,
} from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function sendVerification(email: string) {
  const token = await createToken("verify", email);
  const link = `${APP_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`;
  const { subject, html } = verificationEmail(link);
  await sendEmail(email, subject, html);
}

export async function registerAction(_prev: string | null, formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
    industry: formData.get("industry"),
    bottleneck: formData.get("bottleneck"),
    currentSolution: formData.get("currentSolution"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  if (!(await rateLimit(`register:${clientIp(await headers())}`, 8)).success) {
    return "Demasiados intentos. Esperá un minuto e intentá de nuevo.";
  }

  const { email, password, companyName, industry, bottleneck, currentSolution } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Don't confirm the address exists to the caller — notify the real
    // owner out-of-band instead, then return the same generic message.
    const { subject, html } = duplicateSignupEmail(APP_URL);
    await sendEmail(email, subject, html);
    return "No se pudo crear la bóveda con esos datos.";
  }

  const { hash, salt } = hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      companyName,
      industry,
      bottleneck: bottleneck || null,
      currentSolution: currentSolution || null,
      passwordHash: hash,
      passwordSalt: salt,
    },
  });
  await db.vault.create({ data: { name: "Mi bóveda", ownerId: user.id } });

  // Accept any invites already waiting for this address.
  const pendingInvites = await db.vaultInvite.findMany({
    where: { email: email.toLowerCase(), acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  for (const inv of pendingInvites) {
    await applyMembership(inv.vaultId, user.id, inv.role);
    await db.vaultInvite.update({ where: { id: inv.id }, data: { acceptedAt: new Date() } });
    await db.auditLog.create({
      data: { vaultId: inv.vaultId, action: "member_joined", actorEmail: email.toLowerCase() },
    });
  }

  await sendVerification(email);

  return null;
}

// ── Email verification (soft — never blocks login) ─────────────────────

export async function resendVerificationAction(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return "No autenticado";

  if (!(await rateLimit(`resend-verify:${email}`, 3)).success) {
    return "Ya enviamos uno hace poco. Revisá tu correo (y el spam).";
  }
  const user = await db.user.findUnique({ where: { email }, select: { emailVerified: true } });
  if (user?.emailVerified) return null; // already done, nothing to do
  await sendVerification(email);
  return null;
}

// ── Password reset ─────────────────────────────────────────────────────

// Always returns the same message — never reveals whether the email exists.
export async function requestPasswordResetAction(_prev: string | null, formData: FormData) {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return "Revisá el correo ingresado.";

  const { email } = parsed.data;
  if ((await rateLimit(`reset-req:${clientIp(await headers())}`, 5)).success) {
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      const token = await createToken("reset", email);
      const link = `${APP_URL}/reset/${token}?email=${encodeURIComponent(email)}`;
      const { subject, html } = passwordResetEmail(link);
      await sendEmail(email, subject, html);
    }
  }
  return "ok";
}

export async function resetPasswordAction(_prev: string | null, formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  const { email, token, password } = parsed.data;
  if (!(await rateLimit(`reset-do:${clientIp(await headers())}`, 10)).success) {
    return "Demasiados intentos. Esperá un minuto.";
  }
  if (!(await consumeToken("reset", email, token))) {
    return "El enlace venció o ya se usó. Pedí uno nuevo.";
  }

  const { hash, salt } = hashPassword(password);
  // A successful reset also proves control of the inbox → mark verified.
  await db.user.updateMany({
    where: { email: email.toLowerCase() },
    data: { passwordHash: hash, passwordSalt: salt, emailVerified: new Date() },
  });
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
  try {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) return { ok: false };

    // Throttle online password guessing / credential stuffing per IP.
    if (!(await rateLimit(`login:${clientIp(await headers())}`, 10)).success) return { ok: false };

    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      burnPasswordCompare(parsed.data.password); // constant-time: no user-enumeration via latency
      return { ok: false };
    }

    const valid = verifyPassword(parsed.data.password, user.passwordHash, user.passwordSalt);
    if (!valid) return { ok: false };

    return { ok: true, totpRequired: user.totpEnabled };
  } catch (err) {
    console.error("[checkPasswordAction] error:", err);
    throw err;
  }
}
