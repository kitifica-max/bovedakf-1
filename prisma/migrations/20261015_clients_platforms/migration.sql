-- Clients = vaults (with a color) and a platform per credential. Idempotent for the Supabase SQL editor.
ALTER TABLE "Vault" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "platform" TEXT NOT NULL DEFAULT 'other';
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "loginUrl" TEXT;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "hasTotp" BOOLEAN NOT NULL DEFAULT false;
