-- 60-second undo window for deleted accounts. Idempotent for the Supabase SQL editor.
CREATE TABLE IF NOT EXISTS "DeletedCredential" (
  "id" TEXT PRIMARY KEY,
  "vaultId" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "loginUrl" TEXT,
  "hasTotp" BOOLEAN NOT NULL,
  "encryptedData" TEXT NOT NULL,
  "notes" TEXT,
  "aiAccessible" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "DeletedCredential_deletedAt_idx" ON "DeletedCredential"("deletedAt");
CREATE INDEX IF NOT EXISTS "DeletedCredential_vaultId_idx" ON "DeletedCredential"("vaultId");
DO $$ BEGIN
  ALTER TABLE "DeletedCredential" ADD CONSTRAINT "DeletedCredential_vaultId_fkey"
    FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Row Level Security: same posture as the other tables (access only through the app's server role).
ALTER TABLE "DeletedCredential" ENABLE ROW LEVEL SECURITY;
