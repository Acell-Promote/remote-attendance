-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "status" TYPE "ReportStatus" USING (
  CASE
    WHEN status = 'DRAFT' THEN 'DRAFT'::"ReportStatus"
    WHEN status = 'SUBMITTED' THEN 'SUBMITTED'::"ReportStatus"
    WHEN status = 'REVIEWED' THEN 'REVIEWED'::"ReportStatus"
    ELSE 'DRAFT'::"ReportStatus"
  END
),
ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"ReportStatus"; 