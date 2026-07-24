CREATE TABLE "UploadSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "timelineMaxUploadMb" INTEGER NOT NULL DEFAULT 10,
    "ppjbMaxUploadMb" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UploadSettings_pkey" PRIMARY KEY ("id")
);
