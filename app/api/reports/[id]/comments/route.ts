import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  ApiError,
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { createCommentSchema } from "@/lib/validations";
import { checkReportAccess } from "@/lib/report-utils";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await checkAuth();
    await checkReportAccess(params.id, session);

    const body = await request.json();
    const validatedData = createCommentSchema.parse({
      ...body,
      reportId: params.id,
    });

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        userId: session.user.id,
        reportId: validatedData.reportId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return createApiResponse(comment, "コメントを追加しました");
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Get comments for a report
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await checkAuth();
    await checkReportAccess(params.id, session);

    const comments = await prisma.comment.findMany({
      where: { reportId: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return createApiResponse(comments);
  } catch (error) {
    return createErrorResponse(error);
  }
}
