import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export class ApiError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
    this.name = "ApiError";
  }
}

export async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new ApiError("認証が必要です", 401);
  }
  return session;
}

export function createApiResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const success = status >= 200 && status < 300;

  return NextResponse.json(
    {
      success,
      ...(data && { data }),
      ...(message && { message }),
    },
    { status }
  );
}

export function createErrorResponse(
  error: unknown
): NextResponse<ApiResponse<never>> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.status }
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json(
    {
      success: false,
      error: "予期せぬエラーが発生しました",
    },
    { status: 500 }
  );
}

// Common error responses
export const unauthorizedResponse = () =>
  createErrorResponse(new ApiError("認証が必要です", 401));

export const forbiddenResponse = () =>
  createErrorResponse(new ApiError("権限がありません", 403));

export const notFoundResponse = () =>
  createErrorResponse(new ApiError("リソースが見つかりません", 404));
