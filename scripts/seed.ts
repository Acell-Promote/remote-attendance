import { PrismaClient, ReportStatus, Role } from "@prisma/client";
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
      role: Role.USER,
    },
  });

  // Create an admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log({ user, admin });

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

  // Create some reports
  const reports = [
    {
      id: "report-1",
      date: yesterday,
      title: "昨日の業務報告",
      content:
        "昨日の業務報告:\n\n1. プロジェクトAのコーディング\n2. チームミーティング参加\n3. ドキュメント作成",
      status: ReportStatus.REVIEWED,
      userId: user.id,
      reviewerId: admin.id,
    },
    {
      id: "report-2",
      date: today,
      title: "本日の業務報告",
      content:
        "本日の業務報告:\n\n1. バグ修正\n2. 新機能の実装\n3. コードレビュー",
      status: ReportStatus.SUBMITTED,
      userId: user.id,
    },
  ];

  for (const report of reports) {
    await prisma.report.upsert({
      where: { id: report.id },
      update: {},
      create: report,
    });

    if (report.id === "report-1") {
      // Add some comments to the first report
      await prisma.comment.create({
        data: {
          content: "良い進捗です。引き続きよろしくお願いします。",
          userId: admin.id,
          reportId: report.id,
        },
      });

      await prisma.comment.create({
        data: {
          content: "ご確認ありがとうございます。",
          userId: user.id,
          reportId: report.id,
        },
      });
    }
  }

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
