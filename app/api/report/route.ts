import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { dateRangeSchema } from "@/lib/validations";
import { SessionWithId } from "@/app/types/auth";

export async function GET(request: NextRequest) {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Validate date range
    const validationResult = dateRangeSchema.safeParse({ startDate, endDate });
    if (!validationResult.success) {
      return createApiResponse(null, "開始日と終了日は必須です", 400);
    }

    const start = new Date(startDate!);
    const end = new Date(endDate!);
    end.setHours(23, 59, 59, 999); // Set to end of day

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
        clockIn: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        clockIn: "asc",
      },
    });

    // Calculate total hours worked
    const totalHours = attendanceRecords.reduce((total, record) => {
      if (!record.clockOut) return total;

      const clockIn = new Date(record.clockIn);
      const clockOut = new Date(record.clockOut);
      const hoursWorked =
        (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

      return total + hoursWorked;
    }, 0);

    return createApiResponse({
      records: attendanceRecords,
      totalHours: parseFloat(totalHours.toFixed(2)),
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return createErrorResponse(error);
  }
}
