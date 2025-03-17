import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkAuth,
  createApiResponse,
  createErrorResponse,
} from "@/lib/api-utils";
import { checkReportAccess } from "@/lib/report-utils";
import { SessionWithId } from "@/app/types/auth";
import { ApiError } from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    console.log("Comment POST session:", {
      session,
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
    });

    const { id } = params;
    console.log("Comment POST params:", { id });

    // Check if user has access to the report
    await checkReportAccess(id, session);

    // Parse and validate the comment content
    const body = await request.json();
    const content = body.content;
    if (!content || typeof content !== "string" || !content.trim()) {
      throw new ApiError("コメント内容は必須です", 400);
    }

    console.log("Creating comment:", {
      content,
      userId: session.user.id,
      reportId: id,
    });

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        reportId: id,
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

    console.log("Comment created:", comment);

    return createApiResponse(comment);
  } catch (error) {
    console.error("Error in comment POST:", error);
    return createErrorResponse(error);
  }
}

// Get comments for a report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    const { id } = params;
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
