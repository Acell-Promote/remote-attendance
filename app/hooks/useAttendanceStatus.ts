import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/lib/api-client";
import { ATTENDANCE } from "@/lib/constants/attendance";

interface AttendanceStatus {
  isActive: boolean;
  lastClockIn: string | null;
  plannedClockOut: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Hook to manage attendance status and clock actions
 * @returns Object containing status, loading state, and clock action handler
 */
export function useAttendanceStatus() {
  const { data: session } = useSession();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [lastClockIn, setLastClockIn] = useState<string | null>(null);
  const [plannedClockOut, setPlannedClockOut] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await apiRequest<ApiResponse<AttendanceStatus>>(
        "/api/attendance/status",
        {
          method: "GET",
        },
      );

      if (response.success && response.data) {
        setIsActive(response.data.isActive);
        setLastClockIn(response.data.lastClockIn);
        setPlannedClockOut(response.data.plannedClockOut);
        setError("");
      } else {
        console.error(
          "[useAttendanceStatus] Invalid response format:",
          response,
        );
        setError("ステータスの確認に失敗しました");
      }
      setInitialized(true);
    } catch (error) {
      console.error("[useAttendanceStatus] Status check error:", error);
      setError("ステータスの確認に失敗しました");
      setInitialized(true);
    }
  }, [session]);

  // Add initial status check
  useEffect(() => {
    if (session?.user && !initialized) {
      checkStatus();
    }
  }, [session, checkStatus, initialized]);

  const clockAction = useCallback(
    async (
      action:
        | typeof ATTENDANCE.CLOCK_ACTIONS.IN
        | typeof ATTENDANCE.CLOCK_ACTIONS.OUT,
      plannedClockOut?: string,
      breakMinutes?: number,
    ) => {
      if (!session?.user) return;

      setIsLoading(true);
      setError("");

      try {
        const requestBody = {
          action,
          plannedClockOut,
          breakMinutes,
        };

        await apiRequest<{
          success: boolean;
          data: {
            clockIn?: string;
            plannedClockOut?: string;
            breakMinutes?: number;
          };
        }>("/api/attendance", {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        });

        await checkStatus();
      } catch (error) {
        console.error("[useAttendanceStatus] Clock action error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [session, checkStatus],
  );

  return {
    isActive,
    lastClockIn,
    plannedClockOut,
    isLoading,
    error,
    checkStatus,
    clockAction,
    initialized,
  };
}
