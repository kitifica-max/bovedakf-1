"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { DomainDataState } from "@workos-inc/node";
import { workos } from "@/lib/workos";

async function requireAdmin() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/dashboard");
}

export async function createOrganization(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const domain = (formData.get("domain") as string)?.trim().toLowerCase();
  const firstOwnerEmail =
    (formData.get("firstOwnerEmail") as string)?.trim().toLowerCase() || null;

  if (!name || !domain) throw new Error("Nombre y dominio son requeridos.");

  const workosOrg = await workos.organizations.createOrganization({
    name,
    domainData: [{ domain, state: DomainDataState.Verified }],
  });

  await db.organization.create({
    data: { name, domain, workosOrgId: workosOrg.id, firstOwnerEmail, ssoEnabled: false },
  });

  redirect("/admin/orgs");
}

export async function toggleSso(orgId: string, enabled: boolean) {
  await requireAdmin();
  await db.organization.update({
    where: { id: orgId },
    data: { ssoEnabled: enabled },
  });
  revalidatePath("/admin/orgs");
}

export async function generateAdminPortalLink(orgId: string): Promise<string> {
  await requireAdmin();

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org?.workosOrgId)
    throw new Error("Esta org no tiene WorkOS Org ID configurado.");

  const { link } = await workos.adminPortal.generateLink({
    organization: org.workosOrgId,
    intent: "sso",
  });

  redirect(link);
}
