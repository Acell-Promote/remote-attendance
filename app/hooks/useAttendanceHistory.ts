import { useState, useCallback } from "react";
import {
  AttendanceHistoryState,
  AttendanceRecord,
} from "@/app/types/attendance";
import { apiRequest } from "@/lib/api-client";

export function useAttendanceHistory() {
  const [historyState, setHistoryState] = useState<AttendanceHistoryState>({
    records: [],
    loading: false,
    error: "",
    currentPage: 1,
  });

  const fetchHistory = useCallback(async (page?: number) => {
    try {
      setHistoryState((prev) => ({ ...prev, loading: true, error: "" }));
      const response = await apiRequest<{ data: AttendanceRecord[] }>(
        "/api/attendance/history",
        {
          method: "GET",
        },
      );

      if (!response.data) {
        throw new Error("No records received from the server");
      }

      setHistoryState((prev) => ({
        ...prev,
        records: response.data,
        loading: false,
        currentPage: page || prev.currentPage,
      }));
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistoryState((prev) => ({
        ...prev,
        records: [],
        loading: false,
        error:
          error instanceof Error ? error.message : "履歴の取得に失敗しました",
      }));
    }
  }, []);

  const editRecord = useCallback(async (updatedRecord: AttendanceRecord) => {
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
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  }, []);

  const deleteRecord = useCallback(async (record: AttendanceRecord) => {
    try {
      await apiRequest(`/api/attendance/${record.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  }, []);

  const approvePlannedClockOut = useCallback(
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
        throw new Error("予定退勤時間より前に承認することはできません");
      }

      try {
        await apiRequest(`/api/attendance/${record.id}/approve-planned`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error approving planned clock-out:", error);
        throw error;
      }
    },
    [],
  );

  return {
    historyState,
    fetchHistory,
    editRecord,
    deleteRecord,
    approvePlannedClockOut,
  };
}
