import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await checkAuth();

    // Find the most recent attendance record for the user
    const lastRecord = await prisma.attendance.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Check if the user is currently clocked in (has a record with no clock out)
    const isActive = lastRecord && lastRecord.clockOut === null;

    return createApiResponse({
      isActive,
      lastClockIn: isActive ? lastRecord.clockIn : null,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
