import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
};

export async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new ApiError("認証が必要です", 401);
  }
  return session;
}

export class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ApiError";
  }
}

export function createSuccessResponse<T>(data?: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

export function createErrorResponse(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "サーバーエラーが発生しました",
    },
    { status: 500 }
  );
}
