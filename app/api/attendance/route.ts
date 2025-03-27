import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { SessionWithId } from "@/app/types/auth";

export async function POST(request: NextRequest) {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;

    const data = await request.json();
    const { action, plannedClockOut } = data;

    if (action === "clock-in") {
      if (!plannedClockOut) {
        return createApiResponse(null, "予定退勤時間は必須です", 400);
      }

      // Check for active attendance
      const activeAttendance = await prisma.attendance.findFirst({
        where: {
          userId: session.user.id,
          is_active: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (activeAttendance) {
        return createApiResponse(null, "既に出勤済みです", 400);
      }

      const record = await prisma.attendance.create({
        data: {
          userId: session.user.id,
          clockIn: new Date(),
          plannedClockOut: new Date(plannedClockOut),
          is_active: true,
        },
      });
      return createApiResponse(record, "打刻しました", 201);
    } else if (action === "clock-out") {
      const lastRecord = await prisma.attendance.findFirst({
        where: { userId: session.user.id, is_active: true },
        orderBy: { createdAt: "desc" },
      });

      if (!lastRecord) {
        return createApiResponse(null, "アクティブな勤務がありません", 400);
      }

      const updatedRecord = await prisma.attendance.update({
        where: { id: lastRecord.id },
        data: {
          clockOut: new Date(),
          is_active: false,
        },
      });
      return createApiResponse(updatedRecord, "退勤しました");
    }

    return createApiResponse(null, "無効なアクション", 400);
  } catch (error) {
    console.error("Error creating attendance record:", error);
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

export async function DELETE() {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;

    // Get today's date in JST
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete today's attendance record
    await prisma.attendance.deleteMany({
      where: {
        userId: session.user.id,
        clockIn: {
          gte: today,
        },
        is_active: true, // Only delete active records
      },
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
