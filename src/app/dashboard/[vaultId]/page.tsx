import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailIsVerified } from "@/lib/email-verify";
import { getVaultRole } from "@/lib/vault-access";
import Link from "next/link";
import { AppShell } from "../app-shell";
import { ClientGrid } from "../client-grid";
import { listClients } from "../clients";
import { purgeDeletedCredentials } from "@/lib/credential-trash";
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
  await purgeDeletedCredentials();

  // Account panels (survey, verify banner) are the LOGGED-IN user's own settings — not the
  // vault owner's. 2FA and passkeys live in /dashboard/settings.
  const [auditLogs, me, memberRows, invites] = await Promise.all([
    db.auditLog.findMany({ where: { vaultId }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.user.findUnique({
      where: { id: meId },
      select: { email: true, surveyDismissedAt: true, emailVerified: true },
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
  const clients = await listClients(meId);

  return (
    <AppShell active="clientes">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-brand text-6xl leading-none font-extrabold text-kf-azul uppercase md:text-7xl">Clientes</h1>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center rounded-full border-2 border-kf-azul px-5 text-xs font-extrabold tracking-[0.14em] text-kf-azul no-underline transition hover:bg-kf-azul hover:text-white xl:hidden"
        >
          ← TODOS LOS CLIENTES
        </Link>
      </div>
      <div className="flex flex-wrap items-start gap-7">
        <ClientGrid clients={clients} selectedId={vaultId} className="hidden min-w-0 flex-[1_1_340px] xl:grid" />
        <VaultView
          vault={vault}
          auditLogs={auditLogs}
          showSurvey={!me?.surveyDismissedAt}
          emailVerified={me ? emailIsVerified(me) : true}
          role={role}
          members={members}
          invites={invites}
        />
      </div>
    </AppShell>
  );
}
