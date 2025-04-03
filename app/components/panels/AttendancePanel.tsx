"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAttendanceStatus } from "@/app/hooks/useAttendanceStatus";
import { useAttendanceHistory } from "@/app/hooks/useAttendanceHistory";
import { CurrentStatus } from "@/app/components/attendance/CurrentStatus";
import AttendanceHistory from "@/app/components/attendance/AttendanceHistory";
import { AttendanceRecord } from "@/app/types/attendance";
import WorkTimeAggregation from "../attendance/WorkTimeAggregation";
import { ATTENDANCE } from "@/lib/constants/attendance";

/**
 * Main panel component for managing attendance records and status
 * Handles the integration of attendance tracking, history, and time aggregation
 */
export default function AttendancePanel() {
  const { data: session, status: sessionStatus } = useSession();
  const {
    historyState,
    fetchHistory,
    editRecord,
    deleteRecord,
    approvePlannedClockOut,
  } = useAttendanceHistory();
  const { isActive, isLoading, clockAction, checkStatus, initialized } =
    useAttendanceStatus();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Handle clock in/out actions with validation
  const handleClockAction = async (
    action:
      | typeof ATTENDANCE.CLOCK_ACTIONS.IN
      | typeof ATTENDANCE.CLOCK_ACTIONS.OUT,
    plannedClockOut?: string,
    breakMinutes?: number,
  ) => {
    try {
      // Convert time string to ISO string for clock-in
      if (action === ATTENDANCE.CLOCK_ACTIONS.IN && plannedClockOut) {
        const now = new Date();
        const [hours, minutes] = plannedClockOut.split(":");
        const plannedTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          parseInt(hours, 10),
          parseInt(minutes, 10),
        );

        // Validate planned clock out time
        if (plannedTime <= now) {
          throw new Error("予定退勤時刻は現在時刻より後に設定してください");
        }

        await clockAction(action, plannedTime.toISOString(), breakMinutes);
      } else if (action === ATTENDANCE.CLOCK_ACTIONS.OUT) {
        await clockAction(action, undefined, breakMinutes);
      }

      await fetchHistory(1);
    } catch (error) {
      console.error("[AttendancePanel] Clock action failed:", error);
      throw error;
    }
  };

  // Handle record editing with validation
  const handleEditRecord = async (record: AttendanceRecord) => {
    try {
      // Validate clock-out time is after clock-in time
      if (record.clockOut) {
        const clockIn = new Date(record.clockIn);
        const clockOut = new Date(record.clockOut);
        if (clockOut <= clockIn) {
          throw new Error("退勤時刻は出勤時刻より後に設定してください");
        }

        // Validate work duration
        const workDurationHours =
          (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
        if (workDurationHours > 24) {
          throw new Error("勤務時間は24時間を超えることはできません");
        }
      }

      // Validate planned clock-out time is after clock-in time
      const plannedClockOut = new Date(record.plannedClockOut);
      const clockIn = new Date(record.clockIn);
      if (plannedClockOut <= clockIn) {
        throw new Error("予定退勤時刻は出勤時刻より後に設定してください");
      }

      await editRecord(record);
      await fetchHistory();
    } catch (error) {
      console.error("Edit record failed:", error);
      alert(error instanceof Error ? error.message : "編集に失敗しました");
    }
  };

  // Handle record deletion with confirmation
  const handleDeleteRecord = async (record: AttendanceRecord) => {
    try {
      if (!window.confirm("この勤怠記録を削除してもよろしいですか？")) {
        return;
      }
      await deleteRecord(record);
      await fetchHistory();
    } catch (error) {
      console.error("Delete record failed:", error);
      alert("削除に失敗しました");
    }
  };

  // Handle planned clock out approval with validation
  const handleApprovePlannedClockOut = async (record: AttendanceRecord) => {
    try {
      if (!record.plannedClockOut) {
        throw new Error("予定退勤時間が設定されていません");
      }

      if (!window.confirm("予定退勤時間を実際の退勤時間として承認しますか？")) {
        return;
      }

      await approvePlannedClockOut(record);
      await fetchHistory();
    } catch (error) {
      console.error("Approve planned clock out failed:", error);
      alert(error instanceof Error ? error.message : "承認に失敗しました");
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setSelectedMonth(newMonth);
  };

  // Fetch history when session is available
  useEffect(() => {
    if (session?.user) {
      Promise.all([fetchHistory(), checkStatus()]).catch((error) => {
        console.error("Failed to fetch initial data:", error);
      });
    }
  }, [session, fetchHistory, checkStatus]);

  // Find active record's clock-in time safely
  const activeRecord = historyState?.records?.find((r) => r.is_active);
  const clockInTime = activeRecord?.clockIn;

  // Debug log before render
  console.log("[AttendancePanel] Pre-render state:", {
    isActive,
    isLoading,
    clockInTime,
    activeRecord,
    sessionStatus,
    initialized,
    historyStateRecords: historyState?.records?.length,
  });

  if (sessionStatus === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">ログイン状態を確認中...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">ログインしてください</p>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">出勤状態を確認中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <CurrentStatus
          isActive={isActive}
          isLoading={isLoading}
          onClockAction={handleClockAction}
          clockInTime={clockInTime}
        />

        <WorkTimeAggregation
          records={historyState?.records || []}
          selectedMonth={selectedMonth}
        />

        <AttendanceHistory
          historyState={historyState}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          onPageChange={fetchHistory}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
          onApprovePlannedClockOut={handleApprovePlannedClockOut}
        />
      </div>
    </div>
  );
}
