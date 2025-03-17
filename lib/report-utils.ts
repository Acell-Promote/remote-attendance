import prisma from "@/lib/prisma";
import { ApiError } from "./api-utils";
import { SessionWithId } from "@/app/types/auth";

// Common report include pattern
export const reportInclude = {
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  reviewer: {
    select: {
      name: true,
      email: true,
    },
  },
  comments: {
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
  },
} as const;

// Check if report exists and user has access
export async function checkReportAccess(
  reportId: string,
  session: SessionWithId
) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      user: true,
    },
  });

  if (!report) {
    throw new ApiError("レポートが見つかりません", 404);
  }

  // Allow access if:
  // 1. User is the report owner
  // 2. User is an admin
  // 3. User is the assigned reviewer
  if (
    report.userId === session.user.id ||
    session.user.role === "ADMIN" ||
    report.reviewerId === session.user.id
  ) {
    return report;
  }

  throw new ApiError("このレポートにアクセスする権限がありません", 403);
}

// Validate report status
export function validateReportStatus(status: string | undefined) {
  if (status && !["DRAFT", "SUBMITTED", "REVIEWED"].includes(status)) {
    throw new ApiError("無効なステータスです", 400);
  }
}

// Delete report and its comments
export async function deleteReportWithComments(reportId: string) {
  // Use transaction to ensure both operations succeed or fail together
  return prisma.$transaction([
    prisma.comment.deleteMany({
      where: { reportId },
    }),
    prisma.report.delete({
      where: { id: reportId },
    }),
  ]);
}
