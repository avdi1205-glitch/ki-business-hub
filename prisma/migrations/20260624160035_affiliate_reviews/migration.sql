-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AffiliateLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 5,
    "pros" TEXT,
    "cons" TEXT,
    "description" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AffiliateLink" ("category", "clicks", "createdAt", "id", "name", "url") SELECT "category", "clicks", "createdAt", "id", "name", "url" FROM "AffiliateLink";
DROP TABLE "AffiliateLink";
ALTER TABLE "new_AffiliateLink" RENAME TO "AffiliateLink";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
