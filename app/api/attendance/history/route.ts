import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkAuth,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await checkAuth();

    // Get all attendance records for the user, sorted by clockIn date (newest first)
    const records = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    return createSuccessResponse({ records });
  } catch (error) {
    return createErrorResponse(error);
  }
}
