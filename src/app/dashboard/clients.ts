import { db } from "@/lib/db";
import type { ClientCard } from "./client-grid";

const select = { id: true, name: true, color: true, _count: { select: { credentials: true } } } as const;

// Owned clients first, then ones shared with the user (as vault members).
export async function listClients(userId: string): Promise<ClientCard[]> {
  const [owned, memberships] = await Promise.all([
    db.vault.findMany({ where: { ownerId: userId }, orderBy: { createdAt: "asc" }, select }),
    db.vaultMember.findMany({
      where: { userId, vault: { ownerId: { not: userId } } },
      orderBy: { createdAt: "asc" },
      select: { vault: { select } },
    }),
  ]);
  const card = (v: (typeof owned)[number], isOwner: boolean) => ({
    id: v.id,
    name: v.name,
    color: v.color,
    accounts: v._count.credentials,
    owned: isOwner,
  });
  return [...owned.map((v) => card(v, true)), ...memberships.map((m) => card(m.vault, false))];
}
