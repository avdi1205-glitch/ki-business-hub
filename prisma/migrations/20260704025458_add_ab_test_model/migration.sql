-- CreateTable
CREATE TABLE "ABTest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "affiliateLinkId" INTEGER NOT NULL,
    "variantA" TEXT NOT NULL,
    "variantB" TEXT NOT NULL,
    "impressionsA" INTEGER NOT NULL DEFAULT 0,
    "impressionsB" INTEGER NOT NULL DEFAULT 0,
    "clicksA" INTEGER NOT NULL DEFAULT 0,
    "clicksB" INTEGER NOT NULL DEFAULT 0,
    "winner" TEXT,
    "confidence" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "appliedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ABTest_affiliateLinkId_fkey" FOREIGN KEY ("affiliateLinkId") REFERENCES "AffiliateLink" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
