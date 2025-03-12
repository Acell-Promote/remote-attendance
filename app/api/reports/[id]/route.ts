import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  createApiResponse,
  checkAuth,
  createErrorResponse,
} from "@/lib/api-utils";
import {
  checkReportAccess,
  reportInclude,
  validateReportStatus,
  deleteReportWithComments,
} from "@/lib/report-utils";
import { SessionWithId } from "@/app/types/auth";

// Get a single report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    const { id } = await params;
    await checkReportAccess(id, session);

    const report = await prisma.report.findUnique({
      where: { id },
      include: reportInclude,
    });

    return createApiResponse(report);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Update a report
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    const { id } = await params;
    await checkReportAccess(id, session);

    const { content, status } = await request.json();
    validateReportStatus(status);

    const report = await prisma.report.update({
      where: { id },
      data: {
        content,
        status,
        updatedAt: new Date(),
      },
      include: reportInclude,
    });

    return createApiResponse(report, "レポートを更新しました");
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Delete a report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = (await checkAuth()) as unknown as SessionWithId;
    const { id } = await params;
    await checkReportAccess(id, session);
    await deleteReportWithComments(id);

    return createApiResponse(null, "レポートを削除しました");
  } catch (error) {
    return createErrorResponse(error);
  }
}
