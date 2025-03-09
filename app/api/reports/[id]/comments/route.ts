import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  ApiError,
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { createCommentSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await checkAuth();
    const body = await request.json();

    // Validate comment data
    const validatedData = createCommentSchema.parse({
      ...body,
      reportId: params.id,
    });

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      throw new ApiError("レポートが見つかりません", 404);
    }

    // Create comment
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
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await checkAuth();

    // Check if report exists and user has access
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      throw new ApiError("レポートが見つかりません", 404);
    }

    if (report.userId !== session.user.id) {
      throw new ApiError("このレポートにアクセスする権限がありません", 403);
    }

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
