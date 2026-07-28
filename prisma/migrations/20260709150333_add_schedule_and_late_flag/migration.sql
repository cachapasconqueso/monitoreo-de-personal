-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "late" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "scheduleEnd" TEXT,
ADD COLUMN     "scheduleStart" TEXT;
