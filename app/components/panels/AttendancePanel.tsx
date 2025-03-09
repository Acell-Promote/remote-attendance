"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/lib/api-client";
import {
  formatTime,
  formatDate,
  formatDateTime,
  calculateDuration,
} from "@/lib/date-utils";
import Pagination from "../common/Pagination";

interface AttendanceRecord {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceStatus {
  isActive: boolean;
  lastClockIn: string | null;
}

// Constants
const RECORDS_PER_PAGE = 5;
const CLOCK_ACTIONS = {
  IN: "clock-in",
  OUT: "clock-out",
} as const;

export default function AttendancePanel() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<"idle" | "clocked-in" | "loading">(
    "idle"
  );
  const [lastClockIn, setLastClockIn] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState("");

  // Attendance history state
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Check current status and fetch history on load
  useEffect(() => {
    if (session) {
      checkStatus();
      fetchAttendanceHistory();
    }
  }, [session]);

  const checkStatus = async () => {
    try {
      const data = await apiRequest<AttendanceStatus>("/api/attendance/status");
      setStatus(data.isActive ? "clocked-in" : "idle");
      setLastClockIn(data.lastClockIn ? new Date(data.lastClockIn) : null);
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const fetchAttendanceHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const data = await apiRequest<{ records: AttendanceRecord[] }>(
        "/api/attendance/history"
      );
      setAttendanceRecords(data.records);
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : "エラーが発生しました"
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleClockAction = async (
    action: (typeof CLOCK_ACTIONS)[keyof typeof CLOCK_ACTIONS]
  ) => {
    setStatus("loading");
    setError("");

    try {
      const response = await apiRequest<{ clockIn?: string }>(
        "/api/attendance",
        {
          method: "POST",
          body: JSON.stringify({ action }),
        }
      );

      if (action === CLOCK_ACTIONS.IN) {
        setStatus("clocked-in");
        setLastClockIn(
          response.clockIn ? new Date(response.clockIn) : new Date()
        );
      } else {
        setStatus("idle");
        setLastClockIn(null);
      }

      fetchAttendanceHistory();
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
      setStatus(action === CLOCK_ACTIONS.IN ? "idle" : "clocked-in");
    }
  };

  // Pagination
  const totalPages = Math.ceil(
    (attendanceRecords?.length || 0) / RECORDS_PER_PAGE
  );
  const currentRecords = attendanceRecords.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">勤怠</h2>

      {/* Current Status Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">現在の状態</h3>
        <div className="mb-6">
          <div className="text-center mb-4">
            <p className="text-gray-600">現在の日時</p>
            <p className="text-2xl font-bold">{formatTime(currentTime)}</p>
            <p className="text-gray-500">{formatDate(currentTime)}</p>
          </div>

          {status === "clocked-in" && lastClockIn && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <p className="text-green-800 font-medium">現在出勤中です</p>
              <p className="text-green-600">
                開始時間: {formatTime(lastClockIn)} (
                {calculateDuration(lastClockIn)})
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() =>
              handleClockAction(
                status === "idle" ? CLOCK_ACTIONS.IN : CLOCK_ACTIONS.OUT
              )
            }
            disabled={status === "loading"}
            className={`py-3 px-6 rounded-md font-medium disabled:opacity-50 ${
              status === "idle"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {status === "loading"
              ? "処理中..."
              : status === "idle"
              ? "出勤"
              : "退勤"}
          </button>
        </div>
      </div>

      {/* Attendance History Section */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-4">出勤履歴</h3>

        {historyError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800">{historyError}</p>
          </div>
        )}

        {historyLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="ml-2 text-gray-600">読み込み中...</p>
          </div>
        ) : !attendanceRecords?.length ? (
          <div className="text-center py-8">
            <p className="text-gray-500">出勤記録がありません</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日付
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      出勤時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      退勤時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      勤務時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.clockIn).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(record.clockIn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.clockOut
                          ? formatDateTime(record.clockOut)
                          : "未退勤"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.clockOut
                          ? calculateDuration(
                              new Date(record.clockIn),
                              new Date(record.clockOut)
                            )
                          : "進行中"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.clockOut
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.clockOut ? "完了" : "進行中"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
