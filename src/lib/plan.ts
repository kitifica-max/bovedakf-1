import "server-only";
import { db } from "@/lib/db";
import { planState } from "@/lib/plan-state";

export async function userPlan(userId: string) {
  return planState(await db.subscription.findUnique({ where: { userId } }));
}

// Charges one share link to the vault OWNER's prepaid balance. Legacy subscriptions (sold before
// prepaid packs) keep unlimited links while active. The caller refunds if the link isn't created
// after all. The conditional decrement makes concurrent shares unable to overspend.
export async function spendShareLink(
  vaultId: string,
): Promise<{ ok: false } | { ok: true; refund: () => Promise<unknown> }> {
  const vault = await db.vault.findUnique({
    where: { id: vaultId },
    select: { ownerId: true, owner: { select: { subscription: true } } },
  });
  if (!vault) return { ok: false };
  if (planState(vault.owner.subscription).kind === "paid") return { ok: true, refund: async () => {} };

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

// Limits follow the vault OWNER's plan, not the acting member's.
export async function vaultOwnerPlan(vaultId: string) {
  const vault = await db.vault.findUnique({
    where: { id: vaultId },
    select: { owner: { select: { subscription: true } } },
  });
  return planState(vault?.owner.subscription);
}
