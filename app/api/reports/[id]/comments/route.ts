import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { createCommentSchema } from "@/lib/validations";
import { checkReportAccess } from "@/lib/report-utils";
import { SessionWithId } from "@/app/types/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    const { id } = await params;
    await checkReportAccess(id, session);

    const body = await request.json();
    const validatedData = createCommentSchema.parse({
      ...body,
      reportId: id,
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
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    const { id } = await params;
    await checkReportAccess(id, session);

    const comments = await prisma.comment.findMany({
      where: { reportId: id },
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
