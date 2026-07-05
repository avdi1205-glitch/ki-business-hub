-- CreateTable
CREATE TABLE "RevenuePlaybook" (
  "id" SERIAL NOT NULL,
  "weekStart" TIMESTAMP(3) NOT NULL,
  "plan" TEXT NOT NULL DEFAULT 'pro',
  "summary" TEXT NOT NULL,
  "projectedMonthlyLift" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "recommendations" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RevenuePlaybook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RevenuePlaybook_weekStart_plan_key" ON "RevenuePlaybook"("weekStart", "plan");
