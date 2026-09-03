import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type Role = "OWNER" | "EDITOR" | "VIEWER";

const RANK: Record<Role, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

export function roleAtLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

// Membership role for a user in a vault, or null. Falls back to the vault's
// ownerId so vaults created before the VaultMember backfill still work.
export async function getVaultRole(vaultId: string, userId: string): Promise<Role | null> {
  const member = await db.vaultMember.findUnique({
    where: { vaultId_userId: { vaultId, userId } },
    select: { role: true },
  });
  if (member) return member.role;
  const vault = await db.vault.findUnique({ where: { id: vaultId }, select: { ownerId: true } });
  return vault && vault.ownerId === userId ? "OWNER" : null;
}

// Gate for server actions / loaders. Returns the caller's identity + role.
export async function requireVaultAccess(
  vaultId: string,
  minRole: Role
): Promise<{ userId: string; email: string; role: Role }> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (!userId || !email) throw new Error("No autenticado");

  const role = await getVaultRole(vaultId, userId);
  if (!role || !roleAtLeast(role, minRole)) throw new Error("Sin acceso a esta bóveda");
  return { userId, email, role };
}
