CREATE TABLE "InternalBotRun" (
    "id" SERIAL NOT NULL,
    "bot" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "playbook" TEXT,
    "goal" TEXT NOT NULL,
    "context" TEXT,
    "answer" TEXT NOT NULL,
    "tags" JSONB,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "recurringTaskKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalBotRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InternalBotRun_createdAt_idx" ON "InternalBotRun"("createdAt" DESC);
CREATE INDEX "InternalBotRun_favorite_createdAt_idx" ON "InternalBotRun"("favorite", "createdAt" DESC);
CREATE INDEX "InternalBotRun_recurringTaskKey_idx" ON "InternalBotRun"("recurringTaskKey");
