-- CreateTable
CREATE TABLE "ContentIdea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "searchVolume" INTEGER,
    "difficulty" INTEGER,
    "affiliateTool" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offen',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
