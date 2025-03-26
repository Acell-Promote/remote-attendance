"use client";

import { useState, useEffect, useCallback } from "react";
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
    plannedClockOut: null,
    error: "",
  });

  const [historyState, setHistoryState] = useState<AttendanceHistoryState>({
    records: [],
    loading: true,
    error: "",
    currentPage: 1,
  });

  const fetchAttendanceHistory = useCallback(async () => {
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
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const response = await apiRequest<{
        success: boolean;
        data: AttendanceStatus;
      }>("/api/attendance/status");

      if (!response.success) {
        throw new Error("Failed to fetch status");
      }

      const { data } = response;
      // Always update the state
      setAttendanceState((prev) => {
        const newState: AttendanceState = {
          ...prev,
          status: data.isActive ? "clocked-in" : "idle",
          lastClockIn: data.lastClockIn ? new Date(data.lastClockIn) : null,
          plannedClockOut: data.plannedClockOut
            ? new Date(data.plannedClockOut)
            : null,
          error: "", // Clear any previous errors
        };
        return newState;
      });
    } catch (error) {
      console.error("Error checking status:", error);
      setAttendanceState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "エラーが発生しました",
      }));
    }
  }, []);

  const handleClockAction = useCallback(
    async (
      action: (typeof ATTENDANCE.CLOCK_ACTIONS)[keyof typeof ATTENDANCE.CLOCK_ACTIONS],
      plannedClockOut?: string,
    ) => {
      // Prevent clock-in if already active or if there's an ongoing record
      if (action === ATTENDANCE.CLOCK_ACTIONS.IN) {
        // Check for any ongoing records
        const hasActiveRecord = historyState.records.some(
          (record) => !record.clockOut,
        );

        if (hasActiveRecord) {
          setAttendanceState((prev) => ({
            ...prev,
            error: "進行中の勤怠記録があるため、新しく出勤することはできません",
          }));
          return;
        }
      }

      setAttendanceState((prev) => ({ ...prev, status: "loading", error: "" }));

      try {
        const requestBody =
          action === ATTENDANCE.CLOCK_ACTIONS.DELETE
            ? undefined
            : {
                action,
                plannedClockOut: plannedClockOut
                  ? new Date(plannedClockOut).toISOString()
                  : undefined,
              };

        await apiRequest<{
          success: boolean;
          data: {
            clockIn?: string;
            plannedClockOut?: string;
          };
        }>("/api/attendance", {
          method:
            action === ATTENDANCE.CLOCK_ACTIONS.DELETE ? "DELETE" : "POST",
          body: requestBody ? JSON.stringify(requestBody) : undefined,
        });

        // Instead of manually setting the state, fetch the current status from the server
        await checkStatus();
        await fetchAttendanceHistory();
      } catch (error) {
        console.error("Clock action error:", error);
        const errorMessage =
          error instanceof Error
            ? `エラーが発生しました: ${error.message}`
            : "エラーが発生しました";
        setAttendanceState((prev) => ({
          ...prev,
          error: errorMessage,
          status: prev.status, // Keep the previous status instead of changing it
        }));
      }
    },
    [fetchAttendanceHistory, checkStatus, historyState.records],
  );

  const handleHistoryDelete = useCallback(
    async (record: AttendanceRecord) => {
      try {
        await apiRequest(`/api/attendance/${record.id}`, {
          method: "DELETE",
        });
        fetchAttendanceHistory();
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    },
    [fetchAttendanceHistory],
  );

  const handleHistoryEdit = useCallback(
    async (updatedRecord: AttendanceRecord) => {
      try {
        await apiRequest(`/api/attendance/${updatedRecord.id}`, {
          method: "PUT",
          body: JSON.stringify({
            clockIn: updatedRecord.clockIn,
            clockOut: updatedRecord.clockOut,
            breakMinutes: updatedRecord.breakMinutes,
            plannedClockOut: updatedRecord.plannedClockOut,
          }),
        });
        fetchAttendanceHistory();
      } catch (error) {
        console.error("Error updating record:", error);
      }
    },
    [fetchAttendanceHistory],
  );

  const handleApprovePlannedClockOut = useCallback(
    async (record: AttendanceRecord) => {
      if (!record.plannedClockOut) return;

      // Get current time in JST
      const now = new Date();
      const jstNow = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
      );

      // Convert planned clock-out time to JST for comparison
      const plannedClockOutJST = new Date(
        new Date(record.plannedClockOut).toLocaleString("en-US", {
          timeZone: "Asia/Tokyo",
        }),
      );

      // Only allow approval if current time has passed the planned clock-out time
      if (jstNow < plannedClockOutJST) {
        setAttendanceState((prev) => ({
          ...prev,
          error: "予定退勤時間より前に承認することはできません",
        }));
        return;
      }

      try {
        await fetchAttendanceHistory();
        await checkStatus();
      } catch (error) {
        console.error("Error approving planned clock-out:", error);
        setAttendanceState((prev) => ({
          ...prev,
          error: "予定退勤時間の承認に失敗しました",
        }));
      }
    },
    [fetchAttendanceHistory, checkStatus, setAttendanceState],
  );

  // Initialize and update current time on client side only
  useEffect(() => {
    const getCurrentTime = () => {
      const now = new Date();
      // Always use toLocaleString with JST timezone for consistent handling
      return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    };

    setCurrentTime(getCurrentTime());
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());

      // If there is an active work and the planned clock out time has passed, automatically clock out
      if (
        attendanceState.status === "clocked-in" &&
        attendanceState.plannedClockOut
      ) {
        const plannedClockOut = new Date(attendanceState.plannedClockOut);
        if (getCurrentTime() >= plannedClockOut) {
          handleClockAction(ATTENDANCE.CLOCK_ACTIONS.OUT);
        }
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [
    attendanceState.status,
    attendanceState.plannedClockOut,
    handleClockAction,
  ]);

  useEffect(() => {
    if (session) {
      checkStatus();
      fetchAttendanceHistory();
    }
  }, [session, checkStatus, fetchAttendanceHistory]);

  // Add more frequent status checks
  useEffect(() => {
    if (session) {
      checkStatus();
      const statusCheck = setInterval(checkStatus, 10000); // Check every 10 seconds
      return () => clearInterval(statusCheck);
    }
  }, [session, checkStatus]);

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-6 text-xl font-semibold text-gray-800">勤怠</h2>

      <CurrentStatus
        currentTime={currentTime}
        attendanceState={attendanceState}
        onClockAction={handleClockAction}
        hasActiveRecord={historyState.records.some(
          (record) => record.is_active,
        )}
        isLoading={historyState.loading}
      />

      <AttendanceHistory
        historyState={historyState}
        onPageChange={(page) =>
          setHistoryState((prev) => ({ ...prev, currentPage: page }))
        }
        onEdit={handleHistoryEdit}
        onDelete={handleHistoryDelete}
        onApprovePlannedClockOut={handleApprovePlannedClockOut}
      />
    </div>
  );
}
