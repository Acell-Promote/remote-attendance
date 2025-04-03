import { useState, useEffect } from "react";
import { ATTENDANCE } from "@/lib/constants/attendance";

interface CurrentStatusProps {
  isActive: boolean;
  isLoading: boolean;
  clockInTime?: string;
  onClockAction: (
    action:
      | typeof ATTENDANCE.CLOCK_ACTIONS.IN
      | typeof ATTENDANCE.CLOCK_ACTIONS.OUT,
    plannedClockOut?: string,
    breakMinutes?: number,
  ) => void;
}

/**
 * Displays the attendance status and allows for clock in/out actions
 *
 * @param isActive - Whether the user is currently clocked in
 * @param isLoading - Indicates if the component is loading
 * @param clockInTime - The time user clocked in, if active
 * @param onClockAction - The handler for clock in/out actions, requires plannedClockOut when clocking in
 */
export function CurrentStatus({
  isActive,
  isLoading,
  clockInTime,
  onClockAction,
}: CurrentStatusProps) {
  const { UI_MESSAGES, CLOCK_ACTIONS } = ATTENDANCE;
  const [currentTime, setCurrentTime] = useState<string>("");
  const [plannedClockOut, setPlannedClockOut] = useState("");
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Log only when important state changes occur
  useEffect(() => {
    console.log("[CurrentStatus] State changed:", {
      isActive,
      isLoading,
      clockInTime,
      plannedClockOut,
      breakMinutes,
      buttonType: isActive ? "退勤 (red)" : "出勤 (blue)",
    });
  }, [isActive, isLoading, clockInTime, plannedClockOut, breakMinutes]);

  // Update current time every second after component is mounted
  useEffect(() => {
    setMounted(true);
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
    };

    // Initial update
    updateCurrentTime();

    // Set up interval for updates
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClockIn = async () => {
    if (!plannedClockOut) {
      alert("予定退勤時間を設定してください");
      return;
    }

    // Validate planned clock out time
    const [hours, minutes] = plannedClockOut.split(":");
    const plannedTime = new Date();
    plannedTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    if (plannedTime <= new Date()) {
      alert("予定退勤時刻は現在時刻より後に設定してください");
      return;
    }

    try {
      await onClockAction(CLOCK_ACTIONS.IN, plannedClockOut, breakMinutes);
    } catch (error) {
      console.error("Clock in failed:", error);
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const handleClockOut = async () => {
    try {
      await onClockAction(CLOCK_ACTIONS.OUT, undefined, breakMinutes);
    } catch (error) {
      console.error("Clock out failed:", error);
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  // Don't render anything until after first mount to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">
        {UI_MESSAGES.CURRENT_STATUS}
      </h2>

      <div className="mt-6 space-y-2">
        <p className="text-lg text-gray-700">
          <span className="font-medium">現在時刻:</span>{" "}
          <span className="font-mono">{currentTime}</span>
        </p>
        {isActive && clockInTime && (
          <p className="text-lg text-gray-700">
            <span className="font-medium">出勤時刻:</span>{" "}
            <span className="font-mono">
              {new Date(clockInTime).toLocaleString("ja-JP", {
                timeZone: "Asia/Tokyo",
              })}
            </span>
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center">
        {!isActive && (
          <div className="mb-6 w-full max-w-[240px] space-y-4">
            <div>
              <label
                htmlFor="plannedClockOut"
                className="block text-sm font-medium text-gray-700"
              >
                予定退勤時間
              </label>
              <div className="mt-1">
                <input
                  type="time"
                  id="plannedClockOut"
                  value={plannedClockOut}
                  onChange={(e) => setPlannedClockOut(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                  required
                  disabled={isLoading}
                  placeholder="HH:MM"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                ※ 出勤前に予定退勤時間を設定してください
              </p>
            </div>

            <div>
              <label
                htmlFor="breakMinutes"
                className="block text-sm font-medium text-gray-700"
              >
                休憩時間 (分)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="breakMinutes"
                  value={breakMinutes}
                  onChange={(e) =>
                    setBreakMinutes(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                  min="0"
                  max="999"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                ※ 予定休憩時間を設定してください
              </p>
            </div>
          </div>
        )}

        <div className="w-full max-w-[240px]">
          {!isActive ? (
            <button
              onClick={handleClockIn}
              disabled={isLoading || !plannedClockOut}
              className="w-full rounded-md bg-indigo-600 py-2 text-base font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600"
            >
              {isLoading ? UI_MESSAGES.LOADING : UI_MESSAGES.CLOCK_IN}
            </button>
          ) : (
            <button
              onClick={handleClockOut}
              disabled={isLoading}
              className="w-full rounded-md bg-red-600 py-2 text-base font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600"
            >
              {isLoading ? UI_MESSAGES.LOADING : UI_MESSAGES.CLOCK_OUT}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
