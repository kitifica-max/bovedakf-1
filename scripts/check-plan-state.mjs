// Run: node scripts/check-plan-state.mjs (Node 23.6+ strips the .ts types natively)
import assert from "node:assert/strict";
import { planState, trialStep, DAY_MS } from "../src/lib/plan-state.ts";

const now = new Date("2026-10-01T12:00:00Z");
const at = (days) => new Date(now.getTime() + days * DAY_MS);
const trial = (endDays, remindersSent = 0) => ({
  plan: "team", status: "TRIALING", seats: 10, currentPeriodEnd: at(endDays), remindersSent,
});

assert.equal(planState(null, now).kind, "free");
assert.equal(planState({ ...trial(0), status: "SUSPENDED" }, now).kind, "free");
assert.equal(planState({ ...trial(0), status: "ACTIVE" }, now).kind, "paid");
assert.equal(planState(trial(1), now).kind, "trial");
assert.equal(planState(trial(0), now).kind, "grace");
const g = planState(trial(-3), now);
assert.ok(g.kind === "grace" && g.deleteAt.getTime() === at(12).getTime());

assert.deepEqual(trialStep(trial(5), now), { action: "none" });
assert.deepEqual(trialStep(trial(-3), now), { action: "none" });
assert.deepEqual(trialStep(trial(-4), now), { action: "remind", n: 1 });
assert.deepEqual(trialStep(trial(-5, 1), now), { action: "none" });
assert.deepEqual(trialStep(trial(-9, 1), now), { action: "remind", n: 2 });
assert.deepEqual(trialStep(trial(-13, 0), now), { action: "remind", n: 3 }); // missed days
assert.deepEqual(trialStep(trial(-14, 3), now), { action: "none" });
assert.deepEqual(trialStep(trial(-15, 3), now), { action: "purge" });
assert.deepEqual(trialStep({ ...trial(-40), status: "ACTIVE" }, now), { action: "none" });

console.log("✓ plan-state: all checks passed");
