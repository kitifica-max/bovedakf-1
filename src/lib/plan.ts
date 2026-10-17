import "server-only";
import { db } from "@/lib/db";

// Charges one share link to the vault OWNER's prepaid balance. The caller refunds if the link isn't
// created after all. The conditional decrement makes concurrent shares unable to overspend.
export async function spendShareLink(
  vaultId: string,
): Promise<{ ok: false } | { ok: true; refund: () => Promise<unknown> }> {
  const vault = await db.vault.findUnique({ where: { id: vaultId }, select: { ownerId: true } });
  if (!vault) return { ok: false };

  const { count } = await db.user.updateMany({
    where: { id: vault.ownerId, linkCredits: { gt: 0 } },
    data: { linkCredits: { decrement: 1 } },
  });
  if (count === 0) return { ok: false };
  return {
    ok: true,
    refund: () => db.user.update({ where: { id: vault.ownerId }, data: { linkCredits: { increment: 1 } } }),
  };
}
