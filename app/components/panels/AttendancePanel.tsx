"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/lib/api-client";
import CurrentStatus from "../attendance/CurrentStatus";
import AttendanceHistory from "../attendance/AttendanceHistory";
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceState,
  AttendanceHistoryState,
} from "@/app/types/attendance";
import { ATTENDANCE } from "@/lib/constants/attendance";

export default function AttendancePanel() {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const [attendanceState, setAttendanceState] = useState<AttendanceState>({
    status: "idle",
    lastClockIn: null,
    error: "",
  });

  const [historyState, setHistoryState] = useState<AttendanceHistoryState>({
    records: [],
    loading: true,
    error: "",
    currentPage: 1,
  });

  // Initialize and update current time on client side only
  useEffect(() => {
    setCurrentTime(new Date());
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
      setAttendanceState((prev) => ({
        ...prev,
        status: data.isActive ? "clocked-in" : "idle",
        lastClockIn: data.lastClockIn ? new Date(data.lastClockIn) : null,
      }));
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const fetchAttendanceHistory = async () => {
    setHistoryState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await apiRequest<{
        success: boolean;
        data: { records: AttendanceRecord[] };
      }>("/api/attendance/history");
      setHistoryState((prev) => ({
        ...prev,
        records: response.data.records,
        loading: false,
      }));
    } catch (error) {
      setHistoryState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "エラーが発生しました",
      }));
    }
  };

  const handleClockAction = async (
    action: (typeof ATTENDANCE.CLOCK_ACTIONS)[keyof typeof ATTENDANCE.CLOCK_ACTIONS]
  ) => {
    setAttendanceState((prev) => ({ ...prev, status: "loading", error: "" }));

    try {
      const response = await apiRequest<{ clockIn?: string }>(
        "/api/attendance",
        {
          method: "POST",
          body: JSON.stringify({ action }),
        }
      );

      setAttendanceState((prev) => ({
        ...prev,
        status: action === ATTENDANCE.CLOCK_ACTIONS.IN ? "clocked-in" : "idle",
        lastClockIn:
          action === ATTENDANCE.CLOCK_ACTIONS.IN
            ? response.clockIn
              ? new Date(response.clockIn)
              : new Date()
            : null,
      }));

      fetchAttendanceHistory();
    } catch (error) {
      setAttendanceState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "エラーが発生しました",
        status: action === ATTENDANCE.CLOCK_ACTIONS.IN ? "idle" : "clocked-in",
      }));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">勤怠</h2>

      <CurrentStatus
        currentTime={currentTime}
        attendanceState={attendanceState}
        onClockAction={handleClockAction}
      />

      <AttendanceHistory
        historyState={historyState}
        onPageChange={(page) =>
          setHistoryState((prev) => ({ ...prev, currentPage: page }))
        }
      />
    </div>
  );
}
