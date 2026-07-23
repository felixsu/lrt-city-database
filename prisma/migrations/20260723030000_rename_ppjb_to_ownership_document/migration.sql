-- 1. Rename Ppjb -> OwnershipDocument (table, primary key, FK constraint)
ALTER TABLE "Ppjb" RENAME TO "OwnershipDocument";
ALTER TABLE "OwnershipDocument" RENAME CONSTRAINT "Ppjb_pkey" TO "OwnershipDocument_pkey";
ALTER TABLE "OwnershipDocument" RENAME CONSTRAINT "Ppjb_userId_fkey" TO "OwnershipDocument_userId_fkey";

-- 1b. Rename PpjbPhoto -> OwnershipDocumentPhoto (table, column, primary key, FK constraint)
ALTER TABLE "PpjbPhoto" RENAME TO "OwnershipDocumentPhoto";
ALTER TABLE "OwnershipDocumentPhoto" RENAME COLUMN "ppjbId" TO "ownershipDocumentId";
ALTER TABLE "OwnershipDocumentPhoto" RENAME CONSTRAINT "PpjbPhoto_pkey" TO "OwnershipDocumentPhoto_pkey";
ALTER TABLE "OwnershipDocumentPhoto" RENAME CONSTRAINT "PpjbPhoto_ppjbId_fkey" TO "OwnershipDocumentPhoto_ownershipDocumentId_fkey";

-- 2. New OwnershipDocument columns
ALTER TABLE "OwnershipDocument" ADD COLUMN "ppjbDate" TIMESTAMP(3);
ALTER TABLE "OwnershipDocument" ADD COLUMN "sppuNumber" TEXT;
ALTER TABLE "OwnershipDocument" ADD COLUMN "sppuDate" TIMESTAMP(3);
ALTER TABLE "OwnershipDocument" ADD COLUMN "sppuImageUrl" TEXT;
ALTER TABLE "OwnershipDocument" ADD COLUMN "sppuImagePublicId" TEXT;

-- 3. Backfill ppjbDate from User.buyDate for users with exactly one ownership document
UPDATE "OwnershipDocument" od
SET "ppjbDate" = u."buyDate"
FROM "User" u
WHERE od."userId" = u.id
  AND u."buyDate" IS NOT NULL
  AND (SELECT COUNT(*) FROM "OwnershipDocument" od2 WHERE od2."userId" = u.id) = 1;

-- 4. PaymentStatus enum
CREATE TYPE "PaymentStatus" AS ENUM ('IN_PROGRESS', 'PAID_OFF');

-- 5. LoanBank table + seed defaults
CREATE TABLE "LoanBank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanBank_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LoanBank_name_key" ON "LoanBank"("name");

INSERT INTO "LoanBank" ("id", "name") VALUES
  (gen_random_uuid()::text, 'BCA'),
  (gen_random_uuid()::text, 'BNI'),
  (gen_random_uuid()::text, 'CIMB'),
  (gen_random_uuid()::text, 'Permata'),
  (gen_random_uuid()::text, 'BRI'),
  (gen_random_uuid()::text, 'BTN'),
  (gen_random_uuid()::text, 'Others');

-- 6. New User columns
ALTER TABLE "User" ADD COLUMN "unitType" TEXT;
ALTER TABLE "User" ADD COLUMN "loanBankId" TEXT;
ALTER TABLE "User" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'IN_PROGRESS';
ALTER TABLE "User" ADD COLUMN "paidOffDate" TIMESTAMP(3);
ALTER TABLE "User" ADD CONSTRAINT "User_loanBankId_fkey" FOREIGN KEY ("loanBankId") REFERENCES "LoanBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Drop the now-relocated/removed User columns (after the backfill above)
ALTER TABLE "User" DROP COLUMN "buyDate";
ALTER TABLE "User" DROP COLUMN "joinDate";
