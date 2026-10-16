-- Prepaid share-link credits. Idempotent so it can be re-run in the Supabase SQL editor.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "linkCredits" INTEGER NOT NULL DEFAULT 5;

DO $$ BEGIN
  CREATE TYPE "LinkPurchaseStatus" AS ENUM ('PENDING', 'PAID');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "LinkPurchase" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "links" INTEGER NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "status" "LinkPurchaseStatus" NOT NULL DEFAULT 'PENDING',
  "wompiLinkId" INTEGER,
  "transactionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "LinkPurchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LinkPurchase_transactionId_key" ON "LinkPurchase"("transactionId");
CREATE INDEX IF NOT EXISTS "LinkPurchase_userId_idx" ON "LinkPurchase"("userId");

DO $$ BEGIN
  ALTER TABLE "LinkPurchase" ADD CONSTRAINT "LinkPurchase_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- The app talks to Postgres through Prisma (bypasses RLS). With RLS on and no
-- policies, the table stays unreachable through Supabase's public Data API.
ALTER TABLE "LinkPurchase" ENABLE ROW LEVEL SECURITY;

-- Trials are gone with the prepaid model: accounts still in a trial become free accounts and keep
-- all their data (the old grace/purge flow no longer exists).
DELETE FROM "Subscription" WHERE "status" = 'TRIALING';
