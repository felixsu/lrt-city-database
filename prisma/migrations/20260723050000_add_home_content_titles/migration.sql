-- Add customizable section titles for the public Home page.
-- DEFAULT applies to the existing singleton row automatically.
ALTER TABLE "HomeContent" ADD COLUMN "aboutTitle" TEXT NOT NULL DEFAULT 'A transit-anchored home in Tebet';
ALTER TABLE "HomeContent" ADD COLUMN "howToJoinTitle" TEXT NOT NULL DEFAULT 'Bergabung dengan kami';
