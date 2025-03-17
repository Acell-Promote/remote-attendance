import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { SessionWithId } from "@/app/types/auth";

export async function GET() {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;

    // Get all attendance records for the user, sorted by clockIn date (newest first)
    const records = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    return createApiResponse({ records });
  } catch (error) {
    return createErrorResponse(error);
  }
}
