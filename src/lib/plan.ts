import "server-only";
import { db } from "@/lib/db";
import { planState } from "@/lib/plan-state";

export async function userPlan(userId: string) {
  return planState(await db.subscription.findUnique({ where: { userId } }));
}

// Limits follow the vault OWNER's plan, not the acting member's.
export async function vaultOwnerPlan(vaultId: string) {
  const vault = await db.vault.findUnique({
    where: { id: vaultId },
    select: { owner: { select: { subscription: true } } },
  });
  return planState(vault?.owner.subscription);
}
