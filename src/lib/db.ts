import { PrismaClient } from "@prisma/client";

// Supabase's dashboard shows "RLS enabled" (green) on every table here — but
// that protects the Data API (PostgREST), which this app never calls. All
// real traffic goes through this Prisma client via DATABASE_URL, connected
// as the `postgres` role. Confirmed 2026-09-04:
//   SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user;
//   -> { rolname: "postgres", rolsuper: false, rolbypassrls: true }
// rolbypassrls=true means Postgres never evaluates RLS for this connection —
// with or without policies (there currently are none on any table either
// way). Tenant isolation for every query below is enforced ENTIRELY by
// application code: requireVaultAccess() in src/lib/vault-access.ts, guarded
// against regressions by scripts/check-vault-authz.mjs on every build.
// Don't assume the Supabase RLS toggle is doing anything for this app.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
