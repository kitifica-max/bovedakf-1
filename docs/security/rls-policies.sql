-- Supabase Row-Level Security — KF-1 / SecureVault
--
-- PREREQUISITE: Prisma connects with the service role (rolbypassrls: true),
-- which skips RLS entirely. To make these policies effective you need a
-- separate application role WITHOUT bypassrls privileges, and pass the
-- current user's ID as a Postgres session variable before each sensitive
-- query (e.g. via a Prisma middleware or $executeRaw).
--
-- Step 1 — Create a non-bypassrls role in the Supabase SQL editor:
--
--   CREATE ROLE kf1_app
--     LOGIN
--     PASSWORD '<strong-password>'
--     NOSUPERUSER NOCREATEDB NOCREATEROLE;
--
--   GRANT CONNECT ON DATABASE postgres TO kf1_app;
--   GRANT USAGE  ON SCHEMA public    TO kf1_app;
--   GRANT SELECT, INSERT, UPDATE, DELETE
--     ON ALL TABLES IN SCHEMA public TO kf1_app;
--   ALTER DEFAULT PRIVILEGES IN SCHEMA public
--     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kf1_app;
--
-- Step 2 — Set DATABASE_URL in Netlify to use kf1_app instead of the service
--          role. The connection string format:
--
--   postgresql://kf1_app:<password>@<host>:5432/<db>?sslmode=require
--
-- Step 3 — Add a Prisma middleware that sets the session variable before
--          every query (see below).
--
-- Step 4 — Run the policies in this file from the Supabase SQL editor.
--
-- ─────────────────────────────────────────────────────────────────────────

-- Enable RLS on the three tables that hold user data.
ALTER TABLE "Vault"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Credential" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShareLink"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VaultMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CliToken"   ENABLE ROW LEVEL SECURITY;

-- ─── Vault ───────────────────────────────────────────────────────────────
-- Owner OR member (any role) can see a vault.
CREATE POLICY vault_select ON "Vault"
  FOR SELECT
  USING (
    "ownerId" = current_setting('app.current_user_id', true)
    OR id IN (
      SELECT "vaultId" FROM "VaultMember"
      WHERE "userId" = current_setting('app.current_user_id', true)
    )
  );

-- Only the owner can create vaults.
CREATE POLICY vault_insert ON "Vault"
  FOR INSERT
  WITH CHECK (
    "ownerId" = current_setting('app.current_user_id', true)
  );

-- Only the owner can update or delete.
CREATE POLICY vault_update ON "Vault"
  FOR UPDATE
  USING ("ownerId" = current_setting('app.current_user_id', true));

CREATE POLICY vault_delete ON "Vault"
  FOR DELETE
  USING ("ownerId" = current_setting('app.current_user_id', true));

-- ─── Credential ──────────────────────────────────────────────────────────
CREATE POLICY credential_select ON "Credential"
  FOR SELECT
  USING (
    "vaultId" IN (
      SELECT id FROM "Vault"
      WHERE "ownerId" = current_setting('app.current_user_id', true)
         OR id IN (
           SELECT "vaultId" FROM "VaultMember"
           WHERE "userId" = current_setting('app.current_user_id', true)
         )
    )
  );

CREATE POLICY credential_insert ON "Credential"
  FOR INSERT
  WITH CHECK (
    "vaultId" IN (
      SELECT id FROM "Vault"
      WHERE "ownerId" = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY credential_update ON "Credential"
  FOR UPDATE
  USING (
    "vaultId" IN (
      SELECT id FROM "Vault"
      WHERE "ownerId" = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY credential_delete ON "Credential"
  FOR DELETE
  USING (
    "vaultId" IN (
      SELECT id FROM "Vault"
      WHERE "ownerId" = current_setting('app.current_user_id', true)
    )
  );

-- ─── ShareLink ───────────────────────────────────────────────────────────
-- Public access (no user ctx) needed for /s/[publicId] — use a separate
-- DB connection or service role only for that route, keeping kf1_app for
-- all authenticated routes.
CREATE POLICY sharelink_select ON "ShareLink"
  FOR SELECT
  USING (
    "credentialId" IN (
      SELECT id FROM "Credential"
      WHERE "vaultId" IN (
        SELECT id FROM "Vault"
        WHERE "ownerId" = current_setting('app.current_user_id', true)
      )
    )
    OR current_setting('app.current_user_id', true) = ''
  );

CREATE POLICY sharelink_insert ON "ShareLink"
  FOR INSERT
  WITH CHECK (
    "credentialId" IN (
      SELECT id FROM "Credential"
      WHERE "vaultId" IN (
        SELECT id FROM "Vault"
        WHERE "ownerId" = current_setting('app.current_user_id', true)
      )
    )
  );

CREATE POLICY sharelink_update ON "ShareLink"
  FOR UPDATE
  USING (
    "credentialId" IN (
      SELECT id FROM "Credential"
      WHERE "vaultId" IN (
        SELECT id FROM "Vault"
        WHERE "ownerId" = current_setting('app.current_user_id', true)
      )
    )
  );

-- ─── CliToken ─────────────────────────────────────────────────────────────
CREATE POLICY clitoken_select ON "CliToken"
  FOR SELECT
  USING ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY clitoken_insert ON "CliToken"
  FOR INSERT
  WITH CHECK ("userId" = current_setting('app.current_user_id', true));

CREATE POLICY clitoken_delete ON "CliToken"
  FOR DELETE
  USING ("userId" = current_setting('app.current_user_id', true));

-- ─── Prisma middleware (add to src/lib/db.ts) ────────────────────────────
--
-- import { PrismaClient } from "@prisma/client";
--
-- const prismaBase = new PrismaClient();
--
-- export const db = prismaBase.$extends({
--   query: {
--     $allOperations({ args, query }) {
--       const { getSession } = require("@/lib/auth");   // or pass userId explicitly
--       return getSession().then(async (session) => {
--         const userId = session?.user?.id ?? "";
--         await prismaBase.$executeRaw`
--           SELECT set_config('app.current_user_id', ${userId}, true)
--         `;
--         return query(args);
--       });
--     },
--   },
-- });
--
-- NOTE: set_config with true (third arg) sets the variable for this
-- transaction only. For connection pooling, use true always; for direct
-- connections, false (session-scope) also works.
