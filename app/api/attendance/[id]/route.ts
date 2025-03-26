import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
  ApiError,
} from "@/lib/api-utils";
import { SessionWithId } from "@/app/types/auth";
import { updateAttendanceSchema } from "@/lib/validations";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    const { id } = await params;

    const record = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!record) {
      return createErrorResponse({ error: "Record not found" });
    }

    if (record.userId !== session.user.id) {
      return createErrorResponse({ error: "Unauthorized" });
    }

    await prisma.attendance.delete({
      where: { id },
    });

    return createApiResponse({ message: "Record deleted successfully" });
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

/**
 * Updates an attendance record
 * - Validates that the user owns the record
 * - Validates that the planned clock-out time is after the clock-in time
 * - Updates the record with the new planned clock-out time
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateAttendanceSchema.parse(body);

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

    // Validate planned clock-out time is after clock-in
    const clockInTime = new Date(validatedData.clockIn);
    if (validatedData.plannedClockOut) {
      const plannedClockOutTime = new Date(validatedData.plannedClockOut);
      if (plannedClockOutTime <= clockInTime) {
        throw new ApiError(
          "予定退勤時間は出勤時間より後である必要があります",
          400,
        );
      }
    }

    if (validatedData.clockOut) {
      const clockOutTime = new Date(validatedData.clockOut);
      if (clockOutTime <= clockInTime) {
        throw new ApiError("退勤時間は出勤時間より後である必要があります", 400);
      }
    }

    // Update the record
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        clockIn: validatedData.clockIn,
        clockOut: validatedData.clockOut,
        plannedClockOut: validatedData.plannedClockOut,
        breakMinutes: validatedData.breakMinutes,
        is_active: validatedData.clockOut ? false : true,
        updatedAt: new Date(),
      },
    });

    return createApiResponse(updatedAttendance, "勤怠記録を更新しました");
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
