import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { message: "Start date and end date are required" },
      { status: 400 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Set to end of day

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      userId: session.user.id,
      clockIn: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      clockIn: "asc",
    },
  });

  // Calculate total hours worked
  const totalHours = attendanceRecords.reduce((total, record) => {
    if (!record.clockOut) return total;

    const clockIn = new Date(record.clockIn);
    const clockOut = new Date(record.clockOut);
    const hoursWorked =
      (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

    return total + hoursWorked;
  }, 0);

  return NextResponse.json({
    records: attendanceRecords,
    totalHours: parseFloat(totalHours.toFixed(2)),
  });
}
