/*
  Warnings:

  - You are about to drop the column `aiGrantId` on the `AuditLog` table. All the data in the column will be lost.
  - The primary key for the `VerificationToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `AIAccessGrant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AIAccessPolicy` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vaultId,userId]` on the table `VaultMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier,token]` on the table `VerificationToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AIAccessGrant" DROP CONSTRAINT "AIAccessGrant_credentialId_fkey";

-- DropForeignKey
ALTER TABLE "AIAccessGrant" DROP CONSTRAINT "AIAccessGrant_grantedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "AIAccessGrant" DROP CONSTRAINT "AIAccessGrant_policyId_fkey";

-- DropForeignKey
ALTER TABLE "AIAccessGrant" DROP CONSTRAINT "AIAccessGrant_revokedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "AIAccessGrant" DROP CONSTRAINT "AIAccessGrant_vaultId_fkey";

-- DropForeignKey
ALTER TABLE "AIAccessPolicy" DROP CONSTRAINT "AIAccessPolicy_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "AIAccessPolicy" DROP CONSTRAINT "AIAccessPolicy_credentialId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_aiGrantId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "aiGrantId";

-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "aiAccessible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VerificationToken" DROP CONSTRAINT "VerificationToken_pkey";

-- DropTable
DROP TABLE "AIAccessGrant";

-- DropTable
DROP TABLE "AIAccessPolicy";

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VaultMember_vaultId_userId_key" ON "VaultMember"("vaultId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
