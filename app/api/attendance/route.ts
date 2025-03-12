import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const { action } = data;

  if (action === "clock-in") {
    const record = await prisma.attendance.create({
      data: { userId: session.user.id, clockIn: new Date() },
    });
    return NextResponse.json(record, { status: 201 });
  } else if (action === "clock-out") {
    const lastRecord = await prisma.attendance.findFirst({
      where: { userId: session.user.id, clockOut: null },
      orderBy: { createdAt: "desc" },
    });

    if (!lastRecord) {
      return NextResponse.json({ message: "No active shift" }, { status: 400 });
    }

    const updatedRecord = await prisma.attendance.update({
      where: { id: lastRecord.id },
      data: { clockOut: new Date() },
    });
    return NextResponse.json(updatedRecord, { status: 200 });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
