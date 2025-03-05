import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the most recent attendance record for the user
    const lastRecord = await prisma.attendance.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Check if the user is currently clocked in (has a record with no clock out)
    const isActive = lastRecord && lastRecord.clockOut === null;

    return NextResponse.json({
      isActive,
      lastClockIn: isActive ? lastRecord.clockIn : null,
    });
  } catch (error) {
    console.error("Error checking attendance status:", error);
    return NextResponse.json(
      { message: "Failed to check attendance status" },
      { status: 500 }
    );
  }
}
