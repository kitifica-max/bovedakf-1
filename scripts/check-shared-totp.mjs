#!/usr/bin/env node
// Self-check for client 2FA codes (src/lib/totp.ts): RFC 6238 SHA1 test vectors + input parsing.
// Run: node scripts/check-shared-totp.mjs  (Node ≥ 23 strips the TS types natively.)
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
    return next(specifier, context);
  },
});
const { parseTotpInput, sharedTotpNow } = await import("../src/lib/totp.ts");

// RFC 6238 appendix B: ASCII "12345678901234567890", 8 digits, 30 s.
const rfc = { secret: "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", digits: 8, period: 30 };
assert.equal(sharedTotpNow(rfc, 59_000).code, "94287082");
assert.equal(sharedTotpNow(rfc, 1111111109_000).code, "07081804");
assert.equal(sharedTotpNow(rfc, 2000000000_000).code, "69279037");
assert.equal(sharedTotpNow(rfc, 59_000).secondsLeft, 1);

// Inputs: spaced lowercase key, otpauth URI with params, junk and non-SHA1 rejected.
assert.deepEqual(parseTotpInput("gezd gnbv gy3t qojq"), { secret: "GEZDGNBVGY3TQOJQ", digits: 6, period: 30 });
assert.deepEqual(
  parseTotpInput("otpauth://totp/IG:lula?secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ&digits=8&period=60&issuer=IG"),
  { secret: "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", digits: 8, period: 60 },
);
assert.equal(parseTotpInput("123456"), null);
assert.equal(parseTotpInput("otpauth://totp/x?secret=GEZDGNBVGY3TQOJQ&algorithm=SHA256"), null);
assert.equal(parseTotpInput("otpauth://totp/x?secret=GEZDGNBVGY3TQOJQ&digits=4"), null);

console.log("shared TOTP: ok");
