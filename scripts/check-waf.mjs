// Run: node scripts/check-waf.mjs
import assert from "node:assert/strict";
import { getRouteCategory, STATIC_FILE } from "../netlify/lib/waf-config.ts";

// Browsing must never burn the strict auth budget.
assert.equal(getRouteCategory("/login", "GET"), "general");
assert.equal(getRouteCategory("/register", "GET"), "general");
assert.equal(getRouteCategory("/api/auth/session", "GET"), "general");
assert.equal(getRouteCategory("/api/auth/csrf", "GET"), "general");
// Credential submits stay strict.
assert.equal(getRouteCategory("/api/auth/callback/credentials", "POST"), "auth");
assert.equal(getRouteCategory("/login", "POST"), "auth");
assert.equal(getRouteCategory("/reset/abc", "POST"), "auth");
// Brute-forceable GETs stay sensitive.
assert.equal(getRouteCategory("/s/abc123", "GET"), "sensitive");
assert.equal(getRouteCategory("/checkout", "GET"), "sensitive");
assert.equal(getRouteCategory("/dashboard/plans", "GET"), "general");

assert.ok(STATIC_FILE.test("/logo-on-dark.svg"));
assert.ok(STATIC_FILE.test("/manifest.json"));
assert.ok(!STATIC_FILE.test("/api/auth/session"));
assert.ok(!STATIC_FILE.test("/s/abc.svg-not"));

console.log("✓ waf: all checks passed");
