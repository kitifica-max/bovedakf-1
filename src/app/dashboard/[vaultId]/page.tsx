import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailIsVerified } from "@/lib/email-verify";
import { getVaultRole } from "@/lib/vault-access";
import { isAdmin } from "@/lib/admin";
import { VaultView } from "./vault-view";

export default async function VaultPage({
  params,
}: {
  params: Promise<{ vaultId: string }>;
}) {
  const { vaultId } = await params;
  const session = await auth();
  const meId = session?.user?.id;

  const role = meId ? await getVaultRole(vaultId, meId) : null;

  const vault = await db.vault.findUnique({
    where: { id: vaultId },
    include: {
      credentials: {
        orderBy: { createdAt: "desc" },
        include: { shareLinks: { orderBy: { createdAt: "desc" } } },
      },
    },
  });

  if (!vault || !role || !meId) notFound();

  // Account panels (survey, verify banner, 2FA, passkeys) are the LOGGED-IN
  // user's own settings — not the vault owner's.
  const [auditLogs, me, passkeys, memberRows, invites] = await Promise.all([
    db.auditLog.findMany({ where: { vaultId }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.user.findUnique({
      where: { id: meId },
      select: { email: true, surveyDismissedAt: true, totpEnabled: true, emailVerified: true },
    }),
    db.authenticator.findMany({
      where: { userId: meId },
      orderBy: { createdAt: "desc" },
      select: { credentialID: true, credentialDeviceType: true, createdAt: true },
    }),
    db.vaultMember.findMany({
      where: { vaultId },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, user: { select: { email: true } } },
    }),
    db.vaultInvite.findMany({
      where: { vaultId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true },
    }),
  ]);

  const members = memberRows.map((m) => ({ id: m.id, email: m.user.email, role: m.role }));
  const userEmail = me?.email ?? session?.user?.email ?? "";
  const isAdminUser = isAdmin(userEmail);
  const orgRole = session?.user?.orgRole;
  const isOrgAdmin = orgRole === "OWNER" || orgRole === "ADMIN";

  return (
    <VaultView
      vault={vault}
      auditLogs={auditLogs}
      showSurvey={!me?.surveyDismissedAt}
      totpEnabled={me?.totpEnabled ?? false}
      emailVerified={me ? emailIsVerified(me) : true}
      passkeys={passkeys}
      role={role}
      members={members}
      invites={invites}
      userEmail={userEmail}
      isAdminUser={isAdminUser}
      isOrgAdmin={isOrgAdmin}
    />
  );
}
