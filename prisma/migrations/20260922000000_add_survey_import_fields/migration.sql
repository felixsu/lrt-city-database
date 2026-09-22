-- Survey fields were previously added to the Prisma schema without a migration.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;

ALTER TABLE "OwnershipDocument"
  ADD COLUMN IF NOT EXISTS "purchasePrice" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentType" TEXT,
  ADD COLUMN IF NOT EXISTS "loanBankName" TEXT,
  ADD COLUMN IF NOT EXISTS "loanTenorMonths" INTEGER,
  ADD COLUMN IF NOT EXISTS "loanMonthsPaid" INTEGER,
  ADD COLUMN IF NOT EXISTS "loanPaymentStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "demandType" TEXT,
  ADD COLUMN IF NOT EXISTS "materialLossPaid" TEXT,
  ADD COLUMN IF NOT EXISTS "materialDetails" TEXT,
  ADD COLUMN IF NOT EXISTS "remainingArrears" TEXT,
  ADD COLUMN IF NOT EXISTS "otherLosses" TEXT,
  ADD COLUMN IF NOT EXISTS "lossBasisCalc" TEXT,
  ADD COLUMN IF NOT EXISTS "pinjamPakai" TEXT,
  ADD COLUMN IF NOT EXISTS "maxWaitDuration" TEXT,
  ADD COLUMN IF NOT EXISTS "compensation" TEXT,
  ADD COLUMN IF NOT EXISTS "surveyTimestamp" TIMESTAMP(3);

DROP INDEX IF EXISTS "OwnershipDocument_accountNumber_key";
