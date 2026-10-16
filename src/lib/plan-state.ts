// Free account: unlimited clients and credentials; up to 5 people (owner + 4). Sharing is paid per link.
export const FREE_SEATS = 5;

type Sub = { plan: string; status: string; seats: number } | null | undefined;

// Only legacy subscriptions (sold before prepaid link packs) still exist; an ACTIVE one keeps
// unlimited links and its seat count. Everything else is the free account.
export type PlanState = { kind: "free" } | { kind: "paid"; plan: string; seats: number };

export function planState(sub: Sub): PlanState {
  return sub?.status === "ACTIVE" ? { kind: "paid", plan: sub.plan, seats: sub.seats } : { kind: "free" };
}
