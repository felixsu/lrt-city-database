ALTER TABLE "OwnershipDocument" ALTER COLUMN "accountNumber" DROP NOT NULL;
CREATE UNIQUE INDEX "OwnershipDocument_accountNumber_key" ON "OwnershipDocument"("accountNumber");
