-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "earlyDeparture" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workedMinutes" INTEGER;
