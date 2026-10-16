"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inviteEmail, sendEmail } from "@/lib/email";
import { inviteSchema, inviteSignupSchema, memberRoleSchema, ROLE_LABEL } from "@/lib/team-validation";
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
  parseTotpInput,
  sharedTotpNow,
  totpAuthUrl,
  verifyTotp,
  type BackupCode,
} from "@/lib/totp";
import {
  clientSchema,
  credentialSchema,
  credentialUpdateSchema,
  dashboardSurveySchema,
  shareLinkSchema,
  totpCodeSchema,
  updateCompanyNameSchema,
} from "@/lib/validation";
import { applyMembership, requireVaultAccess } from "@/lib/vault-access";
import { spendShareLink, userPlan } from "@/lib/plan";
import { FREE_SEATS } from "@/lib/plan-state";
import { findPack } from "@/lib/packs";
import { createEnlacePago } from "@/lib/wompi";
import { purgeDeletedCredentials, UNDO_WINDOW_MS } from "@/lib/credential-trash";
import { patchPayload, readShareable, readTotp, withTotp, writePayload } from "@/lib/credential-payload";

const NO_LINKS_ERROR = "Te quedaste sin links para compartir. Recargá desde Planes para seguir.";
import { rateLimit } from "@/lib/rate-limit";

export async function updateCompanyNameAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return "No autenticado";

  const parsed = updateCompanyNameSchema.safeParse({ companyName: formData.get("companyName") ?? "" });
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

  const parsed = dashboardSurveySchema.safeParse({ answer: formData.get("answer") ?? "" });
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
    vaultId: formData.get("vaultId") ?? "",
    service: formData.get("service") ?? "",
    username: formData.get("username") ?? "",
    secret: formData.get("secret") ?? "",
    notes: formData.get("notes") || undefined,
    platform: formData.get("platform") || undefined,
    loginUrl: formData.get("loginUrl") || undefined,
    totp: formData.get("totp") || undefined,
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  const { vaultId, service, username, secret, notes, platform, loginUrl } = parsed.data;
  const totp = parsed.data.totp ? parseTotpInput(parsed.data.totp) : undefined;
  if (totp === null) return TOTP_INVALID;
  await requireVaultAccess(vaultId, "EDITOR");

  await db.credential.create({
    data: {
      vaultId,
      service,
      username,
      platform,
      loginUrl,
      hasTotp: !!totp,
      encryptedData: writePayload({ secret, notes: notes ?? "", totp }),
    },
  });

  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

// New client = new vault owned by the caller. Clients are unlimited; the cap only stops runaway scripts.
export async function createClientAction(formData: FormData): Promise<{ error: string } | { error: null; id: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  const parsed = clientSchema.safeParse({ name: formData.get("name") ?? "", color: formData.get("color") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const userId = session.user.id;
  if ((await db.vault.count({ where: { ownerId: userId } })) >= 500) {
    return { error: "Llegaste al máximo de clientes. Escribinos a hola@kitifica.com." };
  }
  const client = await db.vault.create({ data: { ...parsed.data, ownerId: userId } });
  revalidatePath("/dashboard");
  return { error: null, id: client.id };
}

const TOTP_INVALID = "Esa clave 2FA no es válida. Pegá la clave de texto (letras A-Z y números 2-7) o el link otpauth:// del QR.";

// Adds or replaces a client account's 2FA seed (e.g. "¿No podés escanear?" key from Instagram).
export async function setTotpAction(vaultId: string, credentialId: string, raw: string) {
  const totp = parseTotpInput(raw);
  if (!totp) return TOTP_INVALID;
  const { email } = await requireVaultAccess(vaultId, "EDITOR");
  const credential = await db.credential.findFirst({ where: { id: credentialId, vaultId } });
  if (!credential) return "Credencial no encontrada";
  await db.credential.update({
    where: { id: credential.id },
    data: { hasTotp: true, encryptedData: withTotp(credential.encryptedData, totp) },
  });
  await db.auditLog.create({
    data: { vaultId, action: "totp_added", credentialService: credential.service, actorEmail: email },
  });
  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

// Current code only — the seed never leaves the server. The UI polls this while the code is open,
// so the audit entry is deduped to one per person, account and 10 minutes.
export async function totpCodeAction(vaultId: string, credentialId: string) {
  const { email } = await requireVaultAccess(vaultId, "VIEWER");
  const credential = await db.credential.findFirst({ where: { id: credentialId, vaultId } });
  const totp = credential?.hasTotp ? readTotp(credential.encryptedData) : null;
  if (!credential || !totp) throw new Error("Esta cuenta no tiene 2FA");
  const recent = await db.auditLog.findFirst({
    where: {
      vaultId,
      action: "totp_code_viewed",
      credentialService: credential.service,
      actorEmail: email,
      createdAt: { gt: new Date(Date.now() - 10 * 60_000) },
    },
    select: { id: true },
  });
  if (!recent) {
    await db.auditLog.create({
      data: { vaultId, action: "totp_code_viewed", credentialService: credential.service, actorEmail: email },
    });
  }
  return sharedTotpNow(totp);
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
  return readShareable(credential.encryptedData);
}

// Deletes for real (nothing else needs to filter "deleted" rows) but keeps an encrypted copy for 60 s.
export async function deleteCredentialAction(vaultId: string, credentialId: string) {
  const { email } = await requireVaultAccess(vaultId, "EDITOR");
  const c = await db.credential.findFirst({ where: { id: credentialId, vaultId } });
  if (!c) return;
  await db.$transaction([
    db.deletedCredential.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        vaultId,
        service: c.service,
        username: c.username,
        platform: c.platform,
        loginUrl: c.loginUrl,
        hasTotp: c.hasTotp,
        encryptedData: c.encryptedData,
        notes: c.notes,
        aiAccessible: c.aiAccessible,
        createdAt: c.createdAt,
      },
      update: { deletedAt: new Date() },
    }),
    db.credential.deleteMany({ where: { id: c.id, vaultId } }),
    db.auditLog.create({ data: { vaultId, action: "credential_deleted", credentialService: c.service, actorEmail: email } }),
  ]);
  await purgeDeletedCredentials();
  revalidatePath(`/dashboard/${vaultId}`);
}

// Restores an account deleted less than 60 s ago, with its encrypted data, 2FA seed and AI flag.
// Its share links are not restored: they were revoked with the delete and stay that way.
export async function undoDeleteCredentialAction(vaultId: string, credentialId: string) {
  const { email } = await requireVaultAccess(vaultId, "EDITOR");
  const t = await db.deletedCredential.findFirst({
    where: { id: credentialId, vaultId, deletedAt: { gte: new Date(Date.now() - UNDO_WINDOW_MS) } },
  });
  if (!t) return "Ya pasó el tiempo para deshacer. Creá la cuenta de nuevo.";
  await db.$transaction([
    db.credential.create({
      data: {
        id: t.id,
        vaultId,
        service: t.service,
        username: t.username,
        platform: t.platform,
        loginUrl: t.loginUrl,
        hasTotp: t.hasTotp,
        encryptedData: t.encryptedData,
        notes: t.notes,
        aiAccessible: t.aiAccessible,
        createdAt: t.createdAt,
      },
    }),
    db.deletedCredential.delete({ where: { id: t.id } }),
    db.auditLog.create({ data: { vaultId, action: "credential_restored", credentialService: t.service, actorEmail: email } }),
  ]);
  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

// Edit an account. Blank secret/notes keep the stored values; the 2FA seed is kept unless removed.
export async function updateCredentialAction(vaultId: string, credentialId: string, formData: FormData) {
  const parsed = credentialUpdateSchema.safeParse({
    service: formData.get("service") ?? "",
    username: formData.get("username") ?? "",
    secret: formData.get("secret") || undefined,
    notes: formData.get("notes") || undefined,
    platform: formData.get("platform") || undefined,
    loginUrl: formData.get("loginUrl") || undefined,
    removeTotp: formData.get("removeTotp") === "on",
  });
  if (!parsed.success) return parsed.error.issues[0].message;
  const { email } = await requireVaultAccess(vaultId, "EDITOR");
  const credential = await db.credential.findFirst({ where: { id: credentialId, vaultId } });
  if (!credential) return "Cuenta no encontrada";

  const { service, username, platform, loginUrl, secret, notes, removeTotp } = parsed.data;
  await db.credential.update({
    where: { id: credential.id },
    data: {
      service,
      username,
      platform,
      loginUrl: loginUrl ?? null,
      ...(removeTotp ? { hasTotp: false } : {}),
      encryptedData: patchPayload(credential.encryptedData, { secret, notes, ...(removeTotp ? { totp: null } : {}) }),
    },
  });
  await db.auditLog.create({
    data: {
      vaultId,
      action: removeTotp && credential.hasTotp ? "credential_updated_totp_removed" : "credential_updated",
      credentialService: service,
      actorEmail: email,
    },
  });
  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

// Rename / recolor a client (vault). Owner only.
export async function updateClientAction(vaultId: string, formData: FormData) {
  const parsed = clientSchema.safeParse({ name: formData.get("name") ?? "", color: formData.get("color") ?? "" });
  if (!parsed.success) return parsed.error.issues[0].message;
  await requireVaultAccess(vaultId, "OWNER");
  await db.vault.update({ where: { id: vaultId }, data: parsed.data });
  revalidatePath("/dashboard", "layout");
  return null;
}

// Deletes a client with all its accounts, links, members and audit (schema cascades). Owner only;
// the typed name must match so a stray click can't do it.
export async function deleteClientAction(vaultId: string, confirmName: string) {
  await requireVaultAccess(vaultId, "OWNER");
  const vault = await db.vault.findUnique({ where: { id: vaultId }, select: { name: true } });
  if (!vault) return "Cliente no encontrado";
  if (confirmName.trim().toLowerCase() !== vault.name.trim().toLowerCase()) return "El nombre no coincide";
  await db.vault.delete({ where: { id: vaultId } });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function createShareLinkAction(vaultId: string, formData: FormData) {
  const parsed = shareLinkSchema.safeParse({
    credentialId: formData.get("credentialId") ?? "",
    permission: formData.get("permission") ?? "",
    expiresInHours: formData.get("expiresInHours") ?? "",
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  const { email: actorEmail } = await requireVaultAccess(vaultId, "EDITOR");
  const { credentialId, permission, expiresInHours } = parsed.data;

  const credential = await db.credential.findFirst({ where: { id: credentialId, vaultId } });
  if (!credential) return "Credencial no encontrada";

  const plaintext = JSON.stringify({
    service: credential.service,
    username: credential.username,
    ...readShareable(credential.encryptedData),
  });

  const linkKey = generateLinkKey();
  const publicId = generatePublicId();

  const charge = await spendShareLink(vaultId);
  if (!charge.ok) return NO_LINKS_ERROR;

  let created;
  try {
    created = await db.shareLink.create({
      data: {
        publicId,
        credentialId,
        permission,
        payload: encryptForLink(plaintext, linkKey),
        expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
      },
    });
  } catch (err) {
    await charge.refund();
    throw err;
  }

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

  const parsed = totpCodeSchema.safeParse({ code: formData.get("code") ?? "" });
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

  const parsed = totpCodeSchema.safeParse({ code: formData.get("code") ?? "" });
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

export async function inviteMemberAction(vaultId: string, formData: FormData): Promise<string | null> {
  const { userId, email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const parsed = inviteSchema.safeParse({ email: formData.get("email") ?? "", role: formData.get("role") ?? "" });
  if (!parsed.success) return parsed.error.issues[0].message;
  const { email, role } = parsed.data;

  if (email === actorEmail.toLowerCase()) return "Ese sos vos.";

  // Seats are people per ACCOUNT (owner included), across every client vault the owner has.
  // Someone already in another of the owner's vaults doesn't take a new seat. Legacy subscriptions
  // keep their seat count when it's higher than the free account's.
  const [plan, members] = await Promise.all([
    userPlan(userId),
    db.vaultMember.findMany({
      where: { vault: { ownerId: userId }, userId: { not: userId } },
      select: { user: { select: { email: true } } },
      distinct: ["userId"],
    }),
  ]);
  const maxSeats = Math.max(FREE_SEATS, plan.kind === "free" ? 0 : plan.seats);
  const people = new Set(members.map((m) => m.user.email.toLowerCase()));
  if (!people.has(email) && people.size + 1 >= maxSeats) {
    return `Tu cuenta permite hasta ${maxSeats} personas. Quitá a alguien de otro cliente para sumar a esta persona.`;
  }

  // Case-insensitive: emails may be stored with mixed case from older signups.
  const already = await db.vaultMember.findFirst({
    where: { vaultId, user: { email: { equals: email, mode: "insensitive" } } },
    select: { id: true },
  });
  if (already) return "Esa persona ya es parte de la bóveda.";

  const token = randomBytes(32).toString("hex");
  // One live invite per (vault, email): replace any prior unaccepted one.
  await db.vaultInvite.deleteMany({ where: { vaultId, email, acceptedAt: null } });
  const created = await db.vaultInvite.create({
    data: {
      vaultId,
      email,
      role,
      token,
      invitedById: userId,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });

  const [vault, session] = await Promise.all([
    db.vault.findUnique({ where: { id: vaultId }, select: { name: true } }),
    auth(),
  ]);
  const inviterName = session?.user?.companyName || actorEmail;
  const link = `${APP_URL}/invite/${token}`;
  const { subject, html } = inviteEmail(link, vault?.name ?? "una bóveda", inviterName, ROLE_LABEL[role]);
  const sent = await sendEmail(email, subject, html);
  if (!sent.ok) {
    // No resend UI yet — don't leave a "pending" invite whose email never went out.
    await db.vaultInvite.delete({ where: { id: created.id } });
    return "No se pudo enviar la invitación. Revisá el correo e intentá de nuevo.";
  }

  await db.auditLog.create({
    data: { vaultId, action: "member_invited", actorEmail, credentialService: email },
  });
  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

export async function revokeInviteAction(vaultId: string, inviteId: string): Promise<void> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const invite = await db.vaultInvite.findFirst({
    where: { id: inviteId, vaultId, acceptedAt: null },
    select: { email: true },
  });
  if (!invite) return;
  await db.vaultInvite.delete({ where: { id: inviteId } });
  await db.auditLog.create({
    data: { vaultId, action: "invite_revoked", actorEmail, credentialService: invite.email },
  });
  revalidatePath(`/dashboard/${vaultId}`);
}

export async function changeMemberRoleAction(
  vaultId: string,
  memberId: string,
  role: "EDITOR" | "VIEWER"
): Promise<string | null> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  // Server action — validate the role at runtime, not just at the type level.
  const parsed = memberRoleSchema.safeParse({ role });
  if (!parsed.success) return "Rol inválido.";

  const member = await db.vaultMember.findFirst({
    where: { id: memberId, vaultId },
    include: { user: { select: { email: true } } },
  });
  if (!member) return "Miembro no encontrado.";
  if (member.role === "OWNER") return "No podés cambiar el rol del dueño.";

  await db.vaultMember.update({ where: { id: memberId }, data: { role: parsed.data.role } });
  await db.auditLog.create({
    data: {
      vaultId,
      action: "member_role_changed",
      actorEmail,
      credentialService: `${member.user.email} → ${ROLE_LABEL[parsed.data.role]}`,
    },
  });
  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

export async function removeMemberAction(vaultId: string, memberId: string): Promise<void> {
  const { email: actorEmail } = await requireVaultAccess(vaultId, "OWNER");
  const member = await db.vaultMember.findFirst({
    where: { id: memberId, vaultId, role: { not: "OWNER" } },
    include: { user: { select: { email: true } } },
  });
  if (!member) return;
  await db.vaultMember.delete({ where: { id: memberId } });
  await db.auditLog.create({
    data: { vaultId, action: "member_removed", actorEmail, credentialService: member.user.email },
  });
  revalidatePath(`/dashboard/${vaultId}`);
}

// New-user path for an invite link: no org form, just a password. The email
// is fixed by the invite; clicking a link mailed to that address is proof of
// inbox control, so the account starts verified. No personal vault is
// created — the invitee joins the inviting org only.
export async function acceptInviteAsNewUserAction(
  token: string,
  formData: FormData
): Promise<{ ok: true; email: string; vaultId: string } | { ok: false; error: string }> {
  const parsed = inviteSignupSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const invite = await db.vaultInvite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt) return { ok: false, error: "Invitación inválida o ya usada." };
  if (invite.expiresAt < new Date()) return { ok: false, error: "La invitación venció." };

  const email = invite.email.toLowerCase();
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { ok: false, error: "Ya tenés una cuenta con ese correo. Entrá para aceptar." };
  }

  const { hash, salt } = hashPassword(parsed.data.password);
  let user;
  try {
    user = await db.user.create({
      data: { email, passwordHash: hash, passwordSalt: salt, emailVerified: new Date() },
    });
  } catch {
    return { ok: false, error: "Ya tenés una cuenta con ese correo. Entrá para aceptar." };
  }

  await applyMembership(invite.vaultId, user.id, invite.role);
  await db.vaultInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
  await db.auditLog.create({
    data: { vaultId: invite.vaultId, action: "member_joined", actorEmail: email },
  });
  return { ok: true, email, vaultId: invite.vaultId };
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

  await applyMembership(invite.vaultId, session.user.id, invite.role);
  await db.vaultInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
  await db.auditLog.create({
    data: { vaultId: invite.vaultId, action: "member_joined", actorEmail: session.user.email },
  });
  revalidatePath(`/dashboard/${invite.vaultId}`);
  return { ok: true, vaultId: invite.vaultId };
}

// ── Link packs (one-time Wompi payments) ─────────────────────────────

export async function buyLinksAction(links: number): Promise<{ error: string } | { error: null; url: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  const pack = findPack(links);
  if (!pack) return { error: "Paquete inválido." };
  if (!(await rateLimit(`buy-links:${session.user.id}`, 5)).success) {
    return { error: "Demasiados intentos. Esperá un minuto." };
  }

  const purchase = await db.linkPurchase.create({
    data: { userId: session.user.id, links: pack.links, amountCents: pack.cents },
  });
  try {
    const enlace = await createEnlacePago({
      ref: purchase.id,
      amountCents: pack.cents,
      productName: `${pack.links} links para compartir · Bóveda KF-1`,
      redirectUrl: `${APP_URL}/dashboard/plans?compra=${purchase.id}`,
      webhookUrl: `${APP_URL}/api/wompi/webhook`,
    });
    await db.linkPurchase.update({ where: { id: purchase.id }, data: { wompiLinkId: enlace.idEnlace } });
    return { error: null, url: enlace.urlEnlace };
  } catch (err) {
    console.error("[buyLinks] Wompi EnlacePago failed:", err);
    await db.linkPurchase.delete({ where: { id: purchase.id } });
    return { error: "No pudimos iniciar el pago. Probá de nuevo en unos minutos." };
  }
}

// ── AI Access (MCP) ──────────────────────────────────────────────────

export async function toggleAiAccessibleAction(
  credentialId: string,
  aiAccessible: boolean
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return "No autenticado";

  const credential = await db.credential.findUnique({
    where: { id: credentialId },
    select: { vaultId: true, service: true },
  });
  if (!credential) return "Credencial no encontrada";

  await requireVaultAccess(credential.vaultId, "OWNER");

  await db.credential.update({
    where: { id: credentialId },
    data: { aiAccessible },
  });

  await db.auditLog.create({
    data: {
      vaultId: credential.vaultId,
      action: aiAccessible ? "ai_access_enabled" : "ai_access_disabled",
      actorEmail: session.user.email ?? "",
      credentialService: credential.service,
    },
  });

  revalidatePath(`/dashboard/${credential.vaultId}`);
  return null;
}
