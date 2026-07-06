-- AlterTable
ALTER TABLE "ClientAssignment" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "RouteTemplate" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteTemplateClient" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RouteTemplateClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteTemplateException" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "RouteTemplateException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RouteTemplateException_templateId_date_key" ON "RouteTemplateException"("templateId", "date");

-- AddForeignKey
ALTER TABLE "ClientAssignment" ADD CONSTRAINT "ClientAssignment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RouteTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteTemplate" ADD CONSTRAINT "RouteTemplate_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteTemplate" ADD CONSTRAINT "RouteTemplate_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteTemplateClient" ADD CONSTRAINT "RouteTemplateClient_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RouteTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteTemplateClient" ADD CONSTRAINT "RouteTemplateClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteTemplateException" ADD CONSTRAINT "RouteTemplateException_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RouteTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
