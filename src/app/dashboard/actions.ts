"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inviteEmail, sendEmail } from "@/lib/email";
import { inviteSchema } from "@/lib/team-validation";
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

// ── Team: invites & members ────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const ROLE_LABEL: Record<"OWNER" | "EDITOR" | "VIEWER", string> = {
  OWNER: "Dueño",
  EDITOR: "Editor",
  VIEWER: "Lector",
};

export async function inviteMemberAction(vaultId: string, formData: FormData): Promise<string | null> {
  const { userId, email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const parsed = inviteSchema.safeParse({ email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) return parsed.error.issues[0].message;
  const { email, role } = parsed.data;

  if (email === actorEmail.toLowerCase()) return "Ese sos vos.";

  const already = await db.vaultMember.findFirst({
    where: { vaultId, user: { email } },
    select: { id: true },
  });
  if (already) return "Esa persona ya es parte de la bóveda.";

  const token = randomBytes(32).toString("hex");
  // One live invite per (vault, email): replace any prior unaccepted one.
  await db.vaultInvite.deleteMany({ where: { vaultId, email, acceptedAt: null } });
  await db.vaultInvite.create({
    data: {
      vaultId,
      email,
      role,
      token,
      invitedById: userId,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });

  const vault = await db.vault.findUnique({ where: { id: vaultId }, select: { name: true } });
  const link = `${APP_URL}/invite/${token}`;
  const { subject, html } = inviteEmail(link, vault?.name ?? "una bóveda", actorEmail, ROLE_LABEL[role]);
  await sendEmail(email, subject, html);

  await db.auditLog.create({
    data: { vaultId, action: "member_invited", actorEmail, credentialService: email },
  });
  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

export async function revokeInviteAction(vaultId: string, inviteId: string): Promise<void> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const { count } = await db.vaultInvite.deleteMany({ where: { id: inviteId, vaultId, acceptedAt: null } });
  if (count) {
    await db.auditLog.create({ data: { vaultId, action: "invite_revoked", actorEmail } });
    revalidatePath(`/dashboard/${vaultId}`);
  }
}

export async function changeMemberRoleAction(
  vaultId: string,
  memberId: string,
  role: "EDITOR" | "VIEWER"
): Promise<string | null> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const member = await db.vaultMember.findFirst({ where: { id: memberId, vaultId } });
  if (!member) return "Miembro no encontrado.";
  if (member.role === "OWNER") return "No podés cambiar el rol del dueño.";
  await db.vaultMember.update({ where: { id: memberId }, data: { role } });
  await db.auditLog.create({ data: { vaultId, action: "member_role_changed", actorEmail } });
  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

export async function removeMemberAction(vaultId: string, memberId: string): Promise<void> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const { count } = await db.vaultMember.deleteMany({
    where: { id: memberId, vaultId, role: { not: "OWNER" } },
  });
  if (count) {
    await db.auditLog.create({ data: { vaultId, action: "member_removed", actorEmail } });
    revalidatePath(`/dashboard/${vaultId}`);
  }
}

export async function acceptInviteAction(
  token: string
): Promise<{ ok: true; vaultId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return { ok: false, error: "No autenticado" };

  const invite = await db.vaultInvite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt) return { ok: false, error: "Invitación inválida o ya usada." };
  if (invite.expiresAt < new Date()) return { ok: false, error: "La invitación venció." };
  if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return { ok: false, error: `Esta invitación es para ${invite.email}.` };
  }

  await db.vaultMember.upsert({
    where: { vaultId_userId: { vaultId: invite.vaultId, userId: session.user.id } },
    create: { vaultId: invite.vaultId, userId: session.user.id, role: invite.role },
    update: { role: invite.role },
  });
  await db.vaultInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
  await db.auditLog.create({
    data: { vaultId: invite.vaultId, action: "member_joined", actorEmail: session.user.email },
  });
  revalidatePath(`/dashboard/${invite.vaultId}`);
  return { ok: true, vaultId: invite.vaultId };
}
