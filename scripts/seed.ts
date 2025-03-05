import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
    },
  });

  console.log({ user });

  // Create some attendance records
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Yesterday's completed attendance
  await prisma.attendance.upsert({
    where: {
      id: "yesterday-attendance",
    },
    update: {},
    create: {
      id: "yesterday-attendance",
      userId: user.id,
      clockIn: new Date(yesterday.setHours(9, 0, 0)),
      clockOut: new Date(yesterday.setHours(17, 0, 0)),
    },
  });

  // Today's ongoing attendance
  await prisma.attendance.upsert({
    where: {
      id: "today-attendance",
    },
    update: {},
    create: {
      id: "today-attendance",
      userId: user.id,
      clockIn: new Date(today.setHours(9, 0, 0)),
      clockOut: null,
    },
  });

  console.log("Database has been seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
