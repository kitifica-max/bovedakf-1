"use server";

import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  decryptAtRest,
  encryptAtRest,
  encryptForLink,
  generateLinkKey,
  generatePublicId,
  hashPassword,
} from "@/lib/crypto";
import {
  generateBackupCodes,
  generateTotpSecret,
  matchBackupCode,
  totpAuthUrl,
  verifyTotp,
  type BackupCode,
} from "@/lib/totp";
import {
  credentialSchema,
  dashboardSurveySchema,
  shareLinkSchema,
  totpCodeSchema,
  updateCompanyNameSchema,
} from "@/lib/validation";
import { requireVaultAccess } from "@/lib/vault-access";

export async function updateCompanyNameAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return "No autenticado";

  const parsed = updateCompanyNameSchema.safeParse({ companyName: formData.get("companyName") });
  if (!parsed.success) return parsed.error.issues[0].message;

  await db.user.update({
    where: { id: session.user.id },
    data: { companyName: parsed.data.companyName },
  });
  revalidatePath("/dashboard", "layout");
  return null;
}

export async function submitSurveyAnswerAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return "No autenticado";

  const parsed = dashboardSurveySchema.safeParse({ answer: formData.get("answer") });
  if (!parsed.success) return parsed.error.issues[0].message;

  await db.user.update({
    where: { id: session.user.id },
    data: { surveyAnswer: parsed.data.answer, surveyDismissedAt: new Date() },
  });
  revalidatePath("/dashboard", "layout");
  return null;
}

export async function dismissSurveyAction() {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.user.update({
    where: { id: session.user.id },
    data: { surveyDismissedAt: new Date() },
  });
  revalidatePath("/dashboard", "layout");
}

export async function createCredentialAction(formData: FormData) {
  const parsed = credentialSchema.safeParse({
    vaultId: formData.get("vaultId"),
    service: formData.get("service"),
    username: formData.get("username"),
    secret: formData.get("secret"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  const { vaultId, service, username, secret, notes } = parsed.data;
  await requireVaultAccess(vaultId, "EDITOR");

  const payload = JSON.stringify({ secret, notes: notes ?? "" });
  await db.credential.create({
    data: { vaultId, service, username, encryptedData: encryptAtRest(payload) },
  });

  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

export async function revealCredentialAction(vaultId: string, credentialId: string) {
  const { email } = await requireVaultAccess(vaultId, "VIEWER");
  const credential = await db.credential.findFirst({ where: { id: credentialId, vaultId } });
  if (!credential) throw new Error("Credencial no encontrada");
  await db.auditLog.create({
    data: {
      vaultId,
      action: "credential_viewed",
      credentialService: credential.service,
      actorEmail: email,
    },
  });
  return JSON.parse(decryptAtRest(credential.encryptedData)) as {
    secret: string;
    notes: string;
  };
}

export async function deleteCredentialAction(vaultId: string, credentialId: string) {
  await requireVaultAccess(vaultId, "EDITOR");
  await db.credential.deleteMany({ where: { id: credentialId, vaultId } });
  revalidatePath(`/dashboard/${vaultId}`);
}

export async function createShareLinkAction(vaultId: string, formData: FormData) {
  const parsed = shareLinkSchema.safeParse({
    credentialId: formData.get("credentialId"),
    permission: formData.get("permission"),
    expiresInHours: formData.get("expiresInHours"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  const { email: actorEmail } = await requireVaultAccess(vaultId, "EDITOR");
  const { credentialId, permission, expiresInHours } = parsed.data;

  const credential = await db.credential.findFirst({ where: { id: credentialId, vaultId } });
  if (!credential) return "Credencial no encontrada";

  const plaintext = JSON.stringify({
    service: credential.service,
    username: credential.username,
    ...JSON.parse(decryptAtRest(credential.encryptedData)),
  });

  const linkKey = generateLinkKey();
  const publicId = generatePublicId();

  const created = await db.shareLink.create({
    data: {
      publicId,
      credentialId,
      permission,
      payload: encryptForLink(plaintext, linkKey),
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
    },
  });

  await db.auditLog.create({
    data: {
      vaultId,
      action: "link_created",
      shareLinkId: created.id,
      credentialService: credential.service,
      actorEmail,
    },
  });

  revalidatePath(`/dashboard/${vaultId}`);
  // Key never touches the DB — only returned once, for the caller to build the URL fragment.
  return { publicId, key: linkKey.toString("base64url") };
}

export async function revokeShareLinkAction(vaultId: string, shareLinkId: string) {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "EDITOR");
  // Scoped by vaultId too — an id alone isn't enough, or any authenticated
  // owner of any vault could revoke another tenant's share link by id.
  const { count } = await db.shareLink.updateMany({
    where: { id: shareLinkId, credential: { vaultId } },
    data: { revokedAt: new Date() },
  });
  if (count === 0) return;
  const link = await db.shareLink.findUnique({
    where: { id: shareLinkId },
    select: { credential: { select: { service: true } } },
  });
  await db.auditLog.create({
    data: { vaultId, shareLinkId, action: "link_revoked", credentialService: link?.credential.service, actorEmail },
  });
  revalidatePath(`/dashboard/${vaultId}`);
}

// ── Two-factor authentication (TOTP) ────────────────────────────────────
//
// Enrollment is two steps: this generates and persists a secret + backup
// codes right away (totpEnabled stays false), then confirmTotpEnrollmentAction
// flips totpEnabled on only once the user proves they can produce a valid
// code from it. An abandoned enrollment never affects login.

export async function initTotpEnrollmentAction(): Promise<
  { error: string } | { error: null; qrDataUrl: string; secret: string; backupCodes: string[] }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const secret = generateTotpSecret();
  const backupCodes = generateBackupCodes();
  const hashedCodes: BackupCode[] = backupCodes.map((code) => {
    const { hash, salt } = hashPassword(code);
    return { hash, salt, usedAt: null };
  });

  await db.user.update({
    where: { id: session.user.id },
    data: {
      totpSecret: encryptAtRest(secret),
      totpEnabled: false,
      totpBackupCodes: hashedCodes,
    },
  });

  const qrDataUrl = await QRCode.toDataURL(totpAuthUrl(secret, session.user.email ?? ""), {
    margin: 1,
    width: 220,
  });

  return { error: null, qrDataUrl, secret, backupCodes };
}

export async function confirmTotpEnrollmentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return "No autenticado";

  const parsed = totpCodeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return parsed.error.issues[0].message;

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.totpSecret) return "Primero iniciá la activación.";

  const secret = decryptAtRest(user.totpSecret);
  if (!verifyTotp(secret, parsed.data.code)) return "Código incorrecto.";

  await db.user.update({ where: { id: session.user.id }, data: { totpEnabled: true } });
  revalidatePath("/dashboard", "layout");
  return null;
}

export async function disableTotpAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return "No autenticado";

  const parsed = totpCodeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return parsed.error.issues[0].message;

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.totpEnabled || !user.totpSecret) return "2FA no está activo.";

  const secret = decryptAtRest(user.totpSecret);
  const validTotp = verifyTotp(secret, parsed.data.code);
  const validBackup =
    !validTotp &&
    matchBackupCode((user.totpBackupCodes as BackupCode[] | null) ?? [], parsed.data.code) !== -1;
  if (!validTotp && !validBackup) return "Código incorrecto.";

  await db.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: false, totpSecret: null, totpBackupCodes: [] },
  });
  revalidatePath("/dashboard", "layout");
  return null;
}

// ── Passkeys (WebAuthn) ──────────────────────────────────────────────────
// Registration/authentication ceremonies are handled by NextAuth's Passkey
// provider (see src/lib/auth.ts) — this is just list/remove for the
// settings panel.

export async function removePasskeyAction(credentialID: string) {
  const session = await auth();
  if (!session?.user?.id) return "No autenticado";

  const { count } = await db.authenticator.deleteMany({
    where: { credentialID, userId: session.user.id },
  });
  if (count === 0) return "Passkey no encontrada.";

  revalidatePath("/dashboard", "layout");
  return null;
}
