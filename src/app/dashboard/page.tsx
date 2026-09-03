import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardIndexPage() {
  const session = await auth();
  const userId = session!.user.id;

  const owned = await db.vault.findFirst({ where: { ownerId: userId }, select: { id: true } });
  if (owned) redirect(`/dashboard/${owned.id}`);

  const membership = await db.vaultMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { vaultId: true },
  });
  if (membership) redirect(`/dashboard/${membership.vaultId}`);

  redirect("/login");
}
