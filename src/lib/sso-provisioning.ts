import { db } from "@/lib/db";
import type { Profile, DefaultCustomAttributes } from "@workos-inc/node";
import { OrgRole, VaultRole } from "@prisma/client";

// Qué orgMinRole puede ver cada OrgRole
const ORG_VAULT_ACCESS: Record<OrgRole, OrgRole[]> = {
  [OrgRole.OWNER]: [OrgRole.MEMBER, OrgRole.ADMIN, OrgRole.OWNER],
  [OrgRole.ADMIN]: [OrgRole.MEMBER, OrgRole.ADMIN],
  [OrgRole.MEMBER]: [OrgRole.MEMBER],
};

export async function provisionOrgVaults(
  userId: string,
  orgId: string,
  orgRole: OrgRole
): Promise<void> {
  const accessibleRoles = ORG_VAULT_ACCESS[orgRole];

  const vaults = await db.vault.findMany({
    where: { organizationId: orgId, orgMinRole: { in: accessibleRoles } },
    select: { id: true },
  });

  if (vaults.length === 0) return;

  await db.vaultMember.createMany({
    data: vaults.map((v) => ({
      vaultId: v.id,
      userId,
      role: VaultRole.VIEWER,
    })),
    skipDuplicates: true,
  });
}

export async function removeOrgVaultAccess(
  userId: string,
  orgId: string,
  rolesToRemove: OrgRole[]
): Promise<void> {
  const vaults = await db.vault.findMany({
    where: { organizationId: orgId, orgMinRole: { in: rolesToRemove } },
    select: { id: true },
  });

  if (vaults.length === 0) return;

  await db.vaultMember.deleteMany({
    where: { userId, vaultId: { in: vaults.map((v) => v.id) } },
  });
}

export async function handleSsoUser(profile: Profile<DefaultCustomAttributes>): Promise<string> {
  const org = await db.organization.findFirst({
    where: { workosOrgId: profile.organizationId ?? undefined },
  });

  if (!org) throw new Error(`No org for workosOrgId: ${profile.organizationId}`);

  const isFirstOwner =
    !!org.firstOwnerEmail &&
    org.firstOwnerEmail.toLowerCase() === profile.email.toLowerCase();
  const orgRole = isFirstOwner ? OrgRole.OWNER : OrgRole.MEMBER;

  // Buscar usuario existente — por workosUserId primero, luego por email
  const byWorkosId = profile.id
    ? await db.user.findUnique({ where: { workosUserId: profile.id } })
    : null;

  const byEmail = await db.user.findUnique({ where: { email: profile.email } });

  const existing = byWorkosId ?? byEmail;

  if (existing) {
    // Auto-link: actualizar con datos SSO
    await db.user.update({
      where: { id: existing.id },
      data: { workosUserId: profile.id, organizationId: org.id, orgRole },
    });
    await provisionOrgVaults(existing.id, org.id, orgRole);
    return existing.id;
  }

  // Usuario nuevo — provisionar sin contraseña
  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || null;

  const user = await db.user.create({
    data: {
      email: profile.email,
      name: fullName,
      workosUserId: profile.id,
      organizationId: org.id,
      orgRole,
      passwordHash: "",
      passwordSalt: "",
    },
  });

  await provisionOrgVaults(user.id, org.id, orgRole);
  return user.id;
}
