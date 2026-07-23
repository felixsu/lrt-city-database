-- AlterTable
ALTER TABLE "User" ADD COLUMN     "unitNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_unitNumber_key" ON "User"("unitNumber");
