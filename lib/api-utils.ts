import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ApiResponse } from "@/app/types/api";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = HTTP_STATUS.BAD_REQUEST
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new ApiError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  return session;
}

export function createApiResponse<T>(
  data?: T,
  message?: string,
  status: number = HTTP_STATUS.OK
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

  return NextResponse.json(
    {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  );
}

// Common error responses
export const unauthorizedResponse = () =>
  createErrorResponse(
    new ApiError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
  );

export const forbiddenResponse = () =>
  createErrorResponse(
    new ApiError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
  );

export const notFoundResponse = () =>
  createErrorResponse(
    new ApiError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
  );
