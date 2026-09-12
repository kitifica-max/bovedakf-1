"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrgRole, VaultRole } from "@prisma/client";
import { provisionOrgVaults, removeOrgVaultAccess } from "@/lib/sso-provisioning";

async function requireOrgAdmin() {
  const session = await auth();
  const orgRole = session?.user?.orgRole;
  if (!session?.user?.id || (orgRole !== OrgRole.OWNER && orgRole !== OrgRole.ADMIN)) {
    redirect("/dashboard");
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true, orgRole: true },
  });
  if (!user?.organizationId) redirect("/dashboard");
  return { userId: session.user.id, orgId: user.organizationId, orgRole: user.orgRole! };
}

const ROLE_RANK: Record<OrgRole, number> = {
  [OrgRole.MEMBER]: 0,
  [OrgRole.ADMIN]: 1,
  [OrgRole.OWNER]: 2,
};

export async function changeMemberRole(memberId: string, newRole: OrgRole) {
  const { orgId, orgRole: callerRole } = await requireOrgAdmin();

  // Solo OWNER puede promover/degradar a otro OWNER
  if (newRole === OrgRole.OWNER && callerRole !== OrgRole.OWNER) {
    throw new Error("Solo el OWNER puede asignar ese rol.");
  }

  const member = await db.user.findUnique({
    where: { id: memberId, organizationId: orgId },
    select: { orgRole: true },
  });
  if (!member) throw new Error("Miembro no encontrado.");

  const oldRole = member.orgRole ?? OrgRole.MEMBER;

  await db.user.update({ where: { id: memberId }, data: { orgRole: newRole } });

  // Propagar cambios de acceso a bóvedas
  if (ROLE_RANK[newRole] > ROLE_RANK[oldRole]) {
    // Rol subió — provisionar bóvedas adicionales
    await provisionOrgVaults(memberId, orgId, newRole);
  } else if (ROLE_RANK[newRole] < ROLE_RANK[oldRole]) {
    // Rol bajó — quitar acceso a bóvedas que ya no le corresponden
    // Roles que newRole ya NO puede ver pero oldRole sí podía
    const toRemove =
      oldRole === OrgRole.OWNER
        ? newRole === OrgRole.ADMIN
          ? [OrgRole.OWNER]
          : [OrgRole.OWNER, OrgRole.ADMIN]
        : [OrgRole.ADMIN]; // ADMIN → MEMBER
    await removeOrgVaultAccess(memberId, orgId, toRemove);
  }

  revalidatePath("/dashboard/org");
}

export async function createOrgVault(formData: FormData) {
  const { orgId } = await requireOrgAdmin();

  const name = (formData.get("name") as string)?.trim();
  const orgMinRole = formData.get("orgMinRole") as OrgRole;

  if (!name || !Object.values(OrgRole).includes(orgMinRole)) {
    throw new Error("Nombre y rol mínimo son requeridos.");
  }

  // Crear bóveda de org
  const vault = await db.vault.create({
    data: {
      name,
      ownerId: (await auth())!.user!.id!,
      organizationId: orgId,
      orgMinRole,
    },
  });

  // Provisionar acceso a todos los miembros que califican
  const qualifying = await db.user.findMany({
    where: {
      organizationId: orgId,
      orgRole: {
        in:
          orgMinRole === OrgRole.MEMBER
            ? [OrgRole.MEMBER, OrgRole.ADMIN, OrgRole.OWNER]
            : orgMinRole === OrgRole.ADMIN
            ? [OrgRole.ADMIN, OrgRole.OWNER]
            : [OrgRole.OWNER],
      },
    },
    select: { id: true },
  });

  if (qualifying.length > 0) {
    await db.vaultMember.createMany({
      data: qualifying.map((u) => ({
        vaultId: vault.id,
        userId: u.id,
        role: VaultRole.VIEWER,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/dashboard/org");
}
