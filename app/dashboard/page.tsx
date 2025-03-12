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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
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
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            リモート勤怠システム
          </h1>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">
              ようこそ、{session.user?.name || session.user?.email}さん
            </span>
            <button
              onClick={() => router.push("/api/auth/signout")}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              サインアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("attendance")}
                className={`${
                  activeTab === "attendance"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                勤怠
              </button>
              <button
                onClick={() => setActiveTab("report")}
                className={`${
                  activeTab === "report"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
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
