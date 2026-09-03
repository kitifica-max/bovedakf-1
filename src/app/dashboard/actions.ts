"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  decryptAtRest,
  encryptAtRest,
  encryptForLink,
  generateLinkKey,
  generatePublicId,
} from "@/lib/crypto";
import { credentialSchema, shareLinkSchema } from "@/lib/validation";

async function requireVaultOwnership(vaultId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const vault = await db.vault.findUnique({ where: { id: vaultId } });
  if (!vault || vault.ownerId !== session.user.id) throw new Error("Bóveda no encontrada");
  return session.user.id;
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
  await requireVaultOwnership(vaultId);

  const payload = JSON.stringify({ secret, notes: notes ?? "" });
  await db.credential.create({
    data: { vaultId, service, username, encryptedData: encryptAtRest(payload) },
  });

  revalidatePath(`/dashboard/${vaultId}`);
  return null;
}

export async function revealCredentialAction(vaultId: string, credentialId: string) {
  await requireVaultOwnership(vaultId);
  const credential = await db.credential.findFirst({ where: { id: credentialId, vaultId } });
  if (!credential) throw new Error("Credencial no encontrada");
  return JSON.parse(decryptAtRest(credential.encryptedData)) as {
    secret: string;
    notes: string;
  };
}

export async function deleteCredentialAction(vaultId: string, credentialId: string) {
  await requireVaultOwnership(vaultId);
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

  await requireVaultOwnership(vaultId);
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
    data: { vaultId, action: "link_created", shareLinkId: created.id },
  });

  revalidatePath(`/dashboard/${vaultId}`);
  // Key never touches the DB — only returned once, for the caller to build the URL fragment.
  return { publicId, key: linkKey.toString("base64url") };
}

export async function revokeShareLinkAction(vaultId: string, shareLinkId: string) {
  await requireVaultOwnership(vaultId);
  await db.shareLink.update({ where: { id: shareLinkId }, data: { revokedAt: new Date() } });
  await db.auditLog.create({ data: { vaultId, shareLinkId, action: "link_revoked" } });
  revalidatePath(`/dashboard/${vaultId}`);
}
