-- AlterTable
ALTER TABLE "AffiliateLink" ADD COLUMN "badge" TEXT;
ALTER TABLE "AffiliateLink" ADD COLUMN "buttonText" TEXT DEFAULT 'Jetzt ansehen';
ALTER TABLE "AffiliateLink" ADD COLUMN "price" TEXT;
