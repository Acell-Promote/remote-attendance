"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface AttendanceRecord {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  const recordsPerPage = 5;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

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
      const response = await fetch("/api/attendance/status");
      if (response.ok) {
        const data = await response.json();
        if (data.isActive) {
          setStatus("clocked-in");
          setLastClockIn(new Date(data.lastClockIn));
        } else {
          setStatus("idle");
          setLastClockIn(null);
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const fetchAttendanceHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch("/api/attendance/history");
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.records);
      } else {
        const errorData = await response.json();
        setHistoryError(errorData.message || "出勤履歴の取得に失敗しました");
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      setHistoryError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleClockIn = async () => {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "clock-in" }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus("clocked-in");
        setLastClockIn(new Date(data.clockIn));
        // Refresh attendance history after clocking in
        fetchAttendanceHistory();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "出勤に失敗しました");
        setStatus("idle");
      }
    } catch (error) {
      console.error("Error clocking in:", error);
      setError("エラーが発生しました。もう一度お試しください。");
      setStatus("idle");
    }
  };

  const handleClockOut = async () => {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "clock-out" }),
      });

      if (response.ok) {
        setStatus("idle");
        setLastClockIn(null);
        // Refresh attendance history after clocking out
        fetchAttendanceHistory();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "退勤に失敗しました");
        setStatus("clocked-in");
      }
    } catch (error) {
      console.error("Error clocking out:", error);
      setError("エラーが発生しました。もう一度お試しください。");
      setStatus("clocked-in");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDuration = () => {
    if (!lastClockIn) return "";

    const now = new Date();
    const diffMs = now.getTime() - lastClockIn.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}時間 ${diffMins}分`;
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateHistoryDuration = (
    clockIn: string,
    clockOut: string | null
  ) => {
    if (!clockOut) return "進行中";

    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}時間 ${diffMins}分`;
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendanceRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(attendanceRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                開始時間: {formatTime(lastClockIn)} ({calculateDuration()})
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
          {status === "idle" ? (
            <button
              onClick={handleClockIn}
              disabled={status === ("loading" as any)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium disabled:bg-indigo-400"
            >
              {status === ("loading" as any) ? "処理中..." : "出勤"}
            </button>
          ) : (
            <button
              onClick={handleClockOut}
              disabled={status === ("loading" as any)}
              className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md font-medium disabled:bg-red-400"
            >
              {status === ("loading" as any) ? "処理中..." : "退勤"}
            </button>
          )}
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
        ) : attendanceRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">出勤記録がありません</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      日付
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      出勤時間
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      退勤時間
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      勤務時間
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
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
                        {calculateHistoryDuration(
                          record.clockIn,
                          record.clockOut
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.clockOut ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            完了
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            進行中
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="ページネーション"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    前へ
                  </button>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === index + 1
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
