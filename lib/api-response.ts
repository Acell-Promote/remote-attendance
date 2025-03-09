import { NextResponse } from "next/server";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

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
  message: string,
  status: number = 400
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

// Common error responses
export const unauthorizedResponse = () =>
  createErrorResponse("認証が必要です", 401);

export const forbiddenResponse = () =>
  createErrorResponse("権限がありません", 403);

export const notFoundResponse = () =>
  createErrorResponse("リソースが見つかりません", 404);
