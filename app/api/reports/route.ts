import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  createApiResponse,
  unauthorizedResponse,
  checkAuth,
  ApiError,
  createErrorResponse,
} from "@/lib/api-utils";
import { createReportSchema, updateReportSchema } from "@/lib/validations";
import { z } from "zod";

// Get reports with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await checkAuth();
    console.log("Session in reports endpoint:", session);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    console.log("Query params:", { page, limit, skip });

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        where: { userId: session.user.id },
        include: {
          user: true,
          comments: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.report.count({
        where: { userId: session.user.id },
      }),
    ]);

    console.log("Found reports:", { count: reports.length, total });
    return createApiResponse({
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in reports endpoint:", error);
    return createErrorResponse(error);
  }
}

// Create a new report
export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth();
    const body = await request.json();
    const validatedData = createReportSchema.parse(body);

    const report = await prisma.report.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        user: true,
        comments: { include: { user: true } },
      },
    });

    return createApiResponse(report, "レポートを作成しました");
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Update a report
export async function PUT(request: NextRequest) {
  try {
    const session = await checkAuth();
    const body = await request.json();
    const validatedData = updateReportSchema.parse(body);

    const report = await prisma.report.findUnique({
      where: { id: validatedData.id },
    });

    if (!report) {
      throw new ApiError("レポートが見つかりません", 404);
    }

    if (report.userId !== session.user.id) {
      throw new ApiError("権限がありません", 403);
    }

    const updatedReport = await prisma.report.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        status: validatedData.status,
      },
      include: {
        user: true,
        comments: { include: { user: true } },
      },
    });

    return createApiResponse(updatedReport, "レポートを更新しました");
  } catch (error) {
    return createErrorResponse(error);
  }
}
