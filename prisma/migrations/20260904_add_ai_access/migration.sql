-- CreateEnum
CREATE TYPE "LinkPermission" AS ENUM ('READ', 'DOWNLOAD');

-- CreateTable
CREATE TABLE "AIAccessPolicy" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "maxDurationMin" INTEGER NOT NULL DEFAULT 30,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIAccessPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAccessGrant" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "permission" "LinkPermission" NOT NULL DEFAULT 'READ',
    "agentName" TEXT NOT NULL,
    "agentVersion" TEXT,
    "grantedByUserId" TEXT NOT NULL,
    "revokedByUserId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIAccessPolicy_credentialId_key" ON "AIAccessPolicy"("credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "AIAccessGrant_publicId_key" ON "AIAccessGrant"("publicId");

-- CreateIndex
CREATE INDEX "AIAccessGrant_credentialId_idx" ON "AIAccessGrant"("credentialId");

-- CreateIndex
CREATE INDEX "AIAccessGrant_vaultId_idx" ON "AIAccessGrant"("vaultId");

-- AddForeignKey
ALTER TABLE "AIAccessPolicy" ADD CONSTRAINT "AIAccessPolicy_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAccessPolicy" ADD CONSTRAINT "AIAccessPolicy_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAccessGrant" ADD CONSTRAINT "AIAccessGrant_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "AIAccessPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAccessGrant" ADD CONSTRAINT "AIAccessGrant_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAccessGrant" ADD CONSTRAINT "AIAccessGrant_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAccessGrant" ADD CONSTRAINT "AIAccessGrant_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAccessGrant" ADD CONSTRAINT "AIAccessGrant_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_aiGrantId_fkey" FOREIGN KEY ("aiGrantId") REFERENCES "AIAccessGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
