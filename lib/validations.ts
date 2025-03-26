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

/**
 * Schema for validating attendance update requests
 * - clockIn: Required ISO date string for the clock-in time
 * - clockOut: Optional ISO date string for the clock-out time
 * - plannedClockOut: Optional ISO date string for the planned clock-out time
 * - breakMinutes: Required number for break duration in minutes
 */
export const updateAttendanceSchema = z.object({
  clockIn: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "出勤時間は有効な日時である必要があります",
  }),
  clockOut: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "退勤時間は有効な日時である必要があります",
    })
    .nullable(),
  plannedClockOut: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "予定退勤時間は有効な日時である必要があります",
    })
    .optional(),
  breakMinutes: z.number().min(0, "休憩時間は0分以上である必要があります"),
  is_active: z.boolean().optional(),
});
