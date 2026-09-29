-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'TRIALING';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "remindersSent" INTEGER NOT NULL DEFAULT 0;
