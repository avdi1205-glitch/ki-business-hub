-- CreateTable
CREATE TABLE "AffiliateClick" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "affiliateLinkId" INTEGER NOT NULL,
    "articleSlug" TEXT,
    "userId" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "revenue" REAL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'subscribed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdImpression" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleSlug" TEXT,
    "adType" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EarningsLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "affiliateRevenue" REAL NOT NULL DEFAULT 0,
    "adRevenue" REAL NOT NULL DEFAULT 0,
    "sponsorRevenue" REAL NOT NULL DEFAULT 0,
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
