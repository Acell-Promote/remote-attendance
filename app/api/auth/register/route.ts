import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { createApiResponse, createErrorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return createApiResponse(
        null,
        "メールアドレスとパスワードは必須です",
        400
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
        400
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;

    return createApiResponse(
      { user: userWithoutPassword },
      "ユーザー登録が完了しました",
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return createErrorResponse(error);
  }
}
