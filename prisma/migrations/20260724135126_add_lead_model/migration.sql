-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONVERTED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "ppjbNumber" TEXT NOT NULL,
    "sppuNumber" TEXT NOT NULL,
    "buildingId" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "convertedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_convertedUserId_key" ON "Lead"("convertedUserId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedUserId_fkey" FOREIGN KEY ("convertedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
