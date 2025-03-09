import { z } from "zod";
import { ReportStatus } from "../app/types/report";

// Date validation schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// Report validation schemas
export const createReportSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "内容は必須です"),
  status: z.nativeEnum(ReportStatus),
});

export const updateReportSchema = createReportSchema.extend({
  id: z.string().uuid(),
});

// Comment validation schema
export const createCommentSchema = z.object({
  content: z.string().min(1, "コメント内容は必須です"),
  reportId: z.string().uuid(),
});
