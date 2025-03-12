import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { SessionWithId } from "@/app/types/auth";

interface AttendanceStatus {
  isActive: boolean;
  lastClockIn: Date | null;
}

/**
 * Get the current attendance status for the authenticated user
 * Returns whether they are clocked in and their last clock-in time
 */
export async function GET() {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;

    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        clockOut: null,
      },
      orderBy: { createdAt: "desc" },
    });

    const status: AttendanceStatus = {
      isActive: !!activeAttendance,
      lastClockIn: activeAttendance?.clockIn ?? null,
    };

    return createApiResponse(status);
  } catch (error) {
    console.error("Failed to fetch attendance status:", error);
    return createErrorResponse(error);
  }
}
