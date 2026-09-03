import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { VaultView } from "./vault-view";

export default async function VaultPage({
  params,
}: {
  params: Promise<{ vaultId: string }>;
}) {
  const { vaultId } = await params;
  const session = await auth();

  const vault = await db.vault.findUnique({
    where: { id: vaultId },
    include: {
      credentials: {
        orderBy: { createdAt: "desc" },
        include: { shareLinks: { orderBy: { createdAt: "desc" } } },
      },
    },
  });

  if (!vault || vault.ownerId !== session?.user.id) notFound();

  const [auditLogs, owner] = await Promise.all([
    db.auditLog.findMany({
      where: { vaultId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.user.findUnique({
      where: { id: vault.ownerId },
      select: { surveyDismissedAt: true, totpEnabled: true },
    }),
  ]);

  return (
    <VaultView
      vault={vault}
      auditLogs={auditLogs}
      showSurvey={!owner?.surveyDismissedAt}
      totpEnabled={owner?.totpEnabled ?? false}
    />
  );
}
