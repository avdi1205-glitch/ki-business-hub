-- Add double opt-in fields to newsletter subscribers
ALTER TABLE "NewsletterSubscriber"
ADD COLUMN IF NOT EXISTS "confirmTokenHash" TEXT,
ADD COLUMN IF NOT EXISTS "confirmTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_confirmTokenHash_key"
ON "NewsletterSubscriber"("confirmTokenHash");