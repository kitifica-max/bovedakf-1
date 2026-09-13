-- Add PENDING status to enum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDING';

-- Rename paypalSubscriptionId → wompiEnlaceId
ALTER TABLE "Subscription" RENAME COLUMN "paypalSubscriptionId" TO "wompiEnlaceId";
