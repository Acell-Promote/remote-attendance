/*
  Warnings:

  - The `status` column on the `Report` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "status",
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT';
