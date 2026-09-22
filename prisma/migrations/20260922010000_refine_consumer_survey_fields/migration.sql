ALTER TABLE "User" DROP COLUMN IF EXISTS "remarks";
ALTER TABLE "OwnershipDocument" DROP COLUMN IF EXISTS "unitType";
ALTER TABLE "OwnershipDocument" RENAME COLUMN "demandType" TO "tuntutan";

UPDATE "OwnershipDocument"
SET
  "paymentType" = NULL,
  "loanBankName" = NULL,
  "loanPaymentStatus" = NULL,
  "materialLossPaid" = NULL,
  "otherLosses" = NULL
WHERE COALESCE(LOWER(BTRIM("tuntutan")), '') <> 'refund';
