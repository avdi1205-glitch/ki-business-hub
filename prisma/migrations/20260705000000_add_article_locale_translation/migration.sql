ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "locale" TEXT NOT NULL DEFAULT 'de';
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "translationGroup" TEXT;

CREATE INDEX IF NOT EXISTS "Article_locale_idx" ON "Article"("locale");
CREATE INDEX IF NOT EXISTS "Article_translationGroup_idx" ON "Article"("translationGroup");
