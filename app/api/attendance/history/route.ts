import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "認証されていません" },
        { status: 401 }
      );
    }

    // Get all attendance records for the user, sorted by clockIn date (newest first)
    const records = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    return NextResponse.json(
      { message: "出勤履歴の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
