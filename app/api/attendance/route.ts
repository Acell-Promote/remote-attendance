import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { SessionWithId } from "@/app/types/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;

    const data = await request.json();
    const { action } = data;

    if (action === "clock-in") {
      const record = await prisma.attendance.create({
        data: { userId: session.user.id, clockIn: new Date() },
      });
      return createApiResponse(record, "打刻しました", 201);
    } else if (action === "clock-out") {
      const lastRecord = await prisma.attendance.findFirst({
        where: { userId: session.user.id, clockOut: null },
        orderBy: { createdAt: "desc" },
      });

      if (!lastRecord) {
        return createApiResponse(null, "アクティブな勤務がありません", 400);
      }

      const updatedRecord = await prisma.attendance.update({
        where: { id: lastRecord.id },
        data: { clockOut: new Date() },
      });
      return createApiResponse(updatedRecord, "退勤しました");
    }

    return createApiResponse(null, "無効なアクション", 400);
  } catch (error) {
    return createErrorResponse(error);
  }
}
