-- Timeline events gain a photo+video media gallery instead of one photo.
CREATE TYPE "TimelineMediaType" AS ENUM ('PHOTO', 'VIDEO');

CREATE TABLE "TimelineEventMedia" (
    "id" TEXT NOT NULL,
    "timelineEventId" TEXT NOT NULL,
    "type" "TimelineMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimelineEventMedia_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "TimelineEventMedia" ADD CONSTRAINT "TimelineEventMedia_timelineEventId_fkey"
  FOREIGN KEY ("timelineEventId") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill any existing single photo into the new media table.
INSERT INTO "TimelineEventMedia" ("id", "timelineEventId", "type", "url", "publicId")
SELECT gen_random_uuid()::text, "id", 'PHOTO', "pictureUrl", "picturePublicId"
FROM "TimelineEvent"
WHERE "pictureUrl" IS NOT NULL;

ALTER TABLE "TimelineEvent" DROP COLUMN "pictureUrl";
ALTER TABLE "TimelineEvent" DROP COLUMN "picturePublicId";
