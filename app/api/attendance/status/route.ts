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
  plannedClockOut: Date | null;
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
        is_active: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const status: AttendanceStatus = {
      isActive: !!activeAttendance,
      lastClockIn: activeAttendance?.clockIn ?? null,
      plannedClockOut: activeAttendance?.plannedClockOut ?? null,
    };

    return createApiResponse(status);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return createErrorResponse(error);
  }
}
