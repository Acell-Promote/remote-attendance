"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AttendancePanel from "@/app/components/panels/AttendancePanel";
import ReportPanel from "@/app/components/panels/ReportPanel";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("attendance");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            リモート勤怠システム
          </h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">
              ようこそ、{session.user?.name || session.user?.email}さん
            </span>
            <button
              onClick={() => router.push("/api/auth/signout")}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              サインアウト
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("attendance")}
                className={`${
                  activeTab === "attendance"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
              >
                勤怠
              </button>
              <button
                onClick={() => setActiveTab("report")}
                className={`${
                  activeTab === "report"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
              >
                レポート
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === "attendance" ? <AttendancePanel /> : <ReportPanel />}
          </div>
        </div>
      </main>
    </div>
  );
}
