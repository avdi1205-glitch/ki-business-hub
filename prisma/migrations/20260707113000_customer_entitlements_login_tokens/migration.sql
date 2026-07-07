-- CreateTable
CREATE TABLE "CustomerEntitlement" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stripeCustomerId" TEXT,
    "stripeSessionId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerLoginToken" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerLoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerEntitlement_stripeSessionId_key" ON "CustomerEntitlement"("stripeSessionId");

-- CreateIndex
CREATE INDEX "CustomerEntitlement_email_idx" ON "CustomerEntitlement"("email");

-- CreateIndex
CREATE INDEX "CustomerEntitlement_status_idx" ON "CustomerEntitlement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerLoginToken_tokenHash_key" ON "CustomerLoginToken"("tokenHash");

-- CreateIndex
CREATE INDEX "CustomerLoginToken_email_idx" ON "CustomerLoginToken"("email");

-- CreateIndex
CREATE INDEX "CustomerLoginToken_expiresAt_idx" ON "CustomerLoginToken"("expiresAt");
