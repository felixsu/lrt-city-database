-- 1. New OwnershipDocument columns
ALTER TABLE "OwnershipDocument" ADD COLUMN "unitNumber" TEXT;
ALTER TABLE "OwnershipDocument" ADD COLUMN "unitType" TEXT;

-- 2. Backfill unitNumber/unitType from User for users with exactly one ownership document
UPDATE "OwnershipDocument" od
SET "unitNumber" = u."unitNumber", "unitType" = u."unitType"
FROM "User" u
WHERE od."userId" = u.id
  AND u."unitNumber" IS NOT NULL
  AND (SELECT COUNT(*) FROM "OwnershipDocument" od2 WHERE od2."userId" = u.id) = 1;

-- 3. Drop the relocated User columns (drops User_unitNumber_key automatically)
ALTER TABLE "User" DROP COLUMN "unitNumber";
ALTER TABLE "User" DROP COLUMN "unitType";

-- 4. Enforce uniqueness on the new location, after the backfill
CREATE UNIQUE INDEX "OwnershipDocument_unitNumber_key" ON "OwnershipDocument"("unitNumber");
