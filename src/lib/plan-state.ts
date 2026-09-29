// Pure plan logic — no imports so scripts/check-plan-state.ts can run it directly.

export const TRIAL_DAYS = 30;
export const GRACE_DAYS = 15;
export const REMINDER_DAYS = [4, 8, 12]; // days into grace
export const FREE_CREDENTIAL_LIMIT = 10;
export const FREE_SEATS = 2;
export const DAY_MS = 86_400_000;

type Sub = { plan: string; status: string; seats: number; currentPeriodEnd: Date } | null | undefined;

export type PlanState =
  | { kind: "free" }
  | { kind: "paid"; seats: number }
  | { kind: "trial"; plan: string; seats: number; endsAt: Date }
  | { kind: "grace"; plan: string; deleteAt: Date };

export function planState(sub: Sub, now = new Date()): PlanState {
  if (sub?.status === "ACTIVE") return { kind: "paid", seats: sub.seats };
  if (sub?.status === "TRIALING") {
    if (now < sub.currentPeriodEnd) {
      return { kind: "trial", plan: sub.plan, seats: sub.seats, endsAt: sub.currentPeriodEnd };
    }
    return { kind: "grace", plan: sub.plan, deleteAt: new Date(sub.currentPeriodEnd.getTime() + GRACE_DAYS * DAY_MS) };
  }
  return { kind: "free" };
}

export type TrialStep = { action: "none" } | { action: "remind"; n: number } | { action: "purge" };

// If the cron skips days, only the latest due reminder goes out (n = how many are due).
export function trialStep(
  sub: { status: string; currentPeriodEnd: Date; remindersSent: number },
  now = new Date(),
): TrialStep {
  if (sub.status !== "TRIALING") return { action: "none" };
  const daysInGrace = Math.floor((now.getTime() - sub.currentPeriodEnd.getTime()) / DAY_MS);
  if (daysInGrace >= GRACE_DAYS) return { action: "purge" };
  const due = REMINDER_DAYS.filter((d) => daysInGrace >= d).length;
  return due > sub.remindersSent ? { action: "remind", n: due } : { action: "none" };
}

export const GRACE_ERROR =
  "Tu prueba terminó: la bóveda está en solo lectura. Suscribite o pasate al plan gratis para seguir.";
