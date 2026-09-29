-- Idempotent: production already had TRIALING from an earlier schema.
-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'TRIALING';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "remindersSent" INTEGER NOT NULL DEFAULT 0;
