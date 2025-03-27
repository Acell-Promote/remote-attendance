import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
  ApiError,
} from "@/lib/api-utils";
import { SessionWithId } from "@/app/types/auth";

/**
 * Approves a planned clock-out time by setting it as the actual clock-out time
 * - Validates that the user owns the record
 * - Validates that the record hasn't been clocked out yet
 * - Validates that a planned clock-out time exists
 * - Sets the actual clock-out time to the planned clock-out time
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    const { id } = await params;

    // Get the attendance record
    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new ApiError("勤怠記録が見つかりません", 404);
    }

    // Check ownership
    if (attendance.userId !== session.user.id) {
      throw new ApiError("この勤怠記録を編集する権限がありません", 403);
    }

    // Check if already clocked out
    if (attendance.clockOut) {
      throw new ApiError("すでに退勤済みです", 400);
    }

    // Check if planned clock-out time exists
    if (!attendance.plannedClockOut) {
      throw new ApiError("予定退勤時間が設定されていません", 400);
    }

    // Update the record with the planned clock-out time
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        clockOut: new Date(attendance.plannedClockOut),
        updatedAt: new Date(),
      },
    });

    return createApiResponse(
      updatedAttendance,
      "予定退勤時間を実際の退勤時間として承認しました",
    );
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
