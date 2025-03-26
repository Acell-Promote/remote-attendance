-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Attendance_is_active_idx" ON "Attendance"("is_active");
