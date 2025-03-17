import prisma from "@/lib/prisma";
import { ApiError } from "./api-utils";
import { SessionWithId } from "@/app/types/auth";
import { ReportStatus } from "@prisma/client";
import { REPORT_CONSTANTS } from "./constants";

/**
 * Common include pattern for report queries
 * Standardizes the data structure returned by report-related queries
 */
export const reportInclude = {
  user: {
    select: REPORT_CONSTANTS.QUERY_SELECTIONS.USER_SELECT_FIELDS,
  },
  reviewer: {
    select: REPORT_CONSTANTS.QUERY_SELECTIONS.USER_SELECT_FIELDS,
  },
  comments: {
    include: {
      user: {
        select: REPORT_CONSTANTS.QUERY_SELECTIONS.USER_SELECT_FIELDS,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
} as const;

/**
 * Checks if a user has access to a specific report
 * @param reportId - The ID of the report to check
 * @param session - The user's session information
 * @throws {ApiError} If report is not found or user lacks permission
 * @returns The report if access is granted
 */
export async function checkReportAccess(
  reportId: string,
  session: SessionWithId
) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        user: true,
      },
    });

    if (!report) {
      throw new ApiError(REPORT_CONSTANTS.ERROR_MESSAGES.NOT_FOUND, 404);
    }

    const hasAccess =
      report.userId === session.user.id ||
      session.user.role === "ADMIN" ||
      report.reviewerId === session.user.id;

    if (!hasAccess) {
      throw new ApiError(REPORT_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED, 403);
    }

    return report;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(REPORT_CONSTANTS.ERROR_MESSAGES.ACCESS_ERROR, 500);
  }
}

/**
 * Validates a report status
 * @param status - The status to validate
 * @throws {ApiError} If the status is invalid
 */
export function validateReportStatus(status: string | undefined) {
  if (status && !Object.values(ReportStatus).includes(status as ReportStatus)) {
    throw new ApiError(REPORT_CONSTANTS.ERROR_MESSAGES.INVALID_STATUS, 400);
  }
}

/**
 * Deletes a report and all its associated comments
 * @param reportId - The ID of the report to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteReportWithComments(reportId: string) {
  try {
    return await prisma.$transaction([
      prisma.comment.deleteMany({
        where: { reportId },
      }),
      prisma.report.delete({
        where: { id: reportId },
      }),
    ]);
  } catch (error) {
    console.error("Error deleting report:", error);
    throw new ApiError(REPORT_CONSTANTS.ERROR_MESSAGES.DELETE_ERROR, 500);
  }
}
