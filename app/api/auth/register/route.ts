import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return createApiResponse(
        null,
        "メールアドレスとパスワードは必須です",
        400,
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createApiResponse(
        null,
        "このメールアドレスは既に登録されています",
        400,
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pwd, ...userWithoutPassword } = user;

    return createApiResponse(
      { user: userWithoutPassword },
      "ユーザー登録が完了しました",
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return createErrorResponse(error);
  }
}
