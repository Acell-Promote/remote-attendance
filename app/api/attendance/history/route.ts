import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await checkAuth();
    console.log("Session in history endpoint:", session);

    // Get all attendance records for the user, sorted by clockIn date (newest first)
    const records = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    console.log("Found attendance records:", records);
    return createApiResponse({ records });
  } catch (error) {
    console.error("Error in history endpoint:", error);
    return createErrorResponse(error);
  }
}
