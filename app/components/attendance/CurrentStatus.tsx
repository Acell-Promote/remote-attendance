import { formatTime, formatDate, calculateDuration } from "@/lib/date-utils";
import { ATTENDANCE } from "@/lib/constants/attendance";
import { AttendanceState } from "@/app/types/attendance";
import { useState, useEffect, useRef, useCallback } from "react";

interface CurrentStatusProps {
  currentTime: Date | null;
  attendanceState: AttendanceState;
  onClockAction: (
    action: (typeof ATTENDANCE.CLOCK_ACTIONS)[keyof typeof ATTENDANCE.CLOCK_ACTIONS],
    plannedClockOut?: string,
  ) => void;
  hasActiveRecord: boolean;
  isLoading: boolean;
}

/**
 * Displays the attendance status and allows for clock in/out actions
 *
 * @param currentTime - The current time
 * @param attendanceState - The attendance state
 * @param onClockAction - The handler for clock in/out actions
 */
export default function CurrentStatus({
  currentTime,
  attendanceState: { status, lastClockIn, error },
  onClockAction,
  hasActiveRecord,
  isLoading,
}: CurrentStatusProps) {
  const { UI_MESSAGES, CLOCK_ACTIONS } = ATTENDANCE;
  const timeInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const breakInputRef = useRef<HTMLInputElement>(null);

  // Set the default planned clock out time and date
  const getDefaultPlannedClockOut = useCallback(() => {
    if (!currentTime) return { time: "", date: "" };

    // Create dates in JST
    const defaultTime = new Date(
      currentTime.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
    );
    defaultTime.setHours(defaultTime.getHours() + 8);

    const currentDate = new Date(
      currentTime.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
    );

    // If the planned time crosses to the next day, adjust the date
    if (defaultTime.getDate() !== currentDate.getDate()) {
      const nextDay = new Date(
        currentTime.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
      );
      nextDay.setDate(nextDay.getDate() + 1);
      return {
        time: defaultTime.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Tokyo",
        }),
        date: nextDay.toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" }), // YYYY-MM-DD format
      };
    }

    return {
      time: defaultTime.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Tokyo",
      }),
      date: currentDate.toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" }), // YYYY-MM-DD format
    };
  }, [currentTime]);

  const [plannedClockOut, setPlannedClockOut] = useState(
    getDefaultPlannedClockOut().time,
  );
  const [plannedClockOutDate, setPlannedClockOutDate] = useState(
    getDefaultPlannedClockOut().date,
  );
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [isValidTime, setIsValidTime] = useState(true);
  const [timeError, setTimeError] = useState("");

  // Update plannedClockOutDate when currentTime changes
  useEffect(() => {
    if (currentTime) {
      const defaultPlannedTime = getDefaultPlannedClockOut();
      setPlannedClockOutDate(defaultPlannedTime.date);
      setPlannedClockOut(defaultPlannedTime.time);
    }
  }, [currentTime, getDefaultPlannedClockOut]);

  const validatePlannedTime = (
    date: string,
    time: string,
  ): { isValid: boolean; error: string } => {
    if (!currentTime) return { isValid: true, error: "" };
    if (!time)
      return { isValid: false, error: "予定退勤時間を入力してください" };

    const plannedDateTime = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    plannedDateTime.setHours(hours, minutes);

    const durationMinutes =
      (plannedDateTime.getTime() - currentTime.getTime()) / (1000 * 60);

    if (durationMinutes <= 0) {
      return {
        isValid: false,
        error: "予定退勤時間は現在時刻より後の時間を指定してください",
      };
    }

    return { isValid: true, error: "" };
  };

  const handleTimeChange = () => {
    if (!timeInputRef.current) return;

    const newTime = timeInputRef.current.value;
    setPlannedClockOut(newTime);

    if (currentTime && newTime) {
      const currentDate = new Date(currentTime);
      const [hours, minutes] = newTime.split(":").map(Number);
      const selectedDateTime = new Date(plannedClockOutDate);
      selectedDateTime.setHours(hours, minutes);

      const durationMinutes =
        (selectedDateTime.getTime() - currentDate.getTime()) / (1000 * 60);

      if (durationMinutes < 0) {
        const nextDay = new Date(plannedClockOutDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split("T")[0];
        setPlannedClockOutDate(nextDayStr);
        if (dateInputRef.current) {
          dateInputRef.current.value = nextDayStr;
        }

        const validation = validatePlannedTime(nextDayStr, newTime);
        setIsValidTime(validation.isValid);
        setTimeError(validation.error);
        return;
      }

      const validation = validatePlannedTime(plannedClockOutDate, newTime);
      setIsValidTime(validation.isValid);
      setTimeError(validation.error);
    } else {
      setIsValidTime(false);
      setTimeError("予定退勤時間を入力してください");
    }
  };

  const handleDateChange = () => {
    if (!dateInputRef.current) return;

    const newDate = dateInputRef.current.value;
    setPlannedClockOutDate(newDate);

    if (plannedClockOut && currentTime) {
      const validation = validatePlannedTime(newDate, plannedClockOut);
      setIsValidTime(validation.isValid);
      setTimeError(validation.error);
    }
  };

  const handleBreakMinutesChange = (value: number) => {
    if (value < 0 || value > 999) return;
    setBreakMinutes(value);
    if (breakInputRef.current) {
      breakInputRef.current.value = value.toString();
    }
  };

  // Calculate planned duration considering both date and time
  const calculatePlannedDuration = (endTime: string) => {
    if (!currentTime || !endTime) return "";
    const end = new Date(
      plannedClockOutDate || currentTime.toISOString().split("T")[0],
    );
    const [hours, minutes] = endTime.split(":").map(Number);
    end.setHours(hours, minutes);
    const start = new Date(currentTime);

    const durationMinutes =
      (end.getTime() - start.getTime()) / (1000 * 60) - breakMinutes;
    return durationMinutes.toString();
  };

  const formatDuration = (hours: number) => {
    const hoursStr = hours.toFixed(1);
    return `約${hoursStr}h`;
  };

  const isPlannedTimeValid = () => {
    if (!currentTime || !plannedClockOut || !plannedClockOutDate) return false;
    const plannedDateTime = new Date(
      `${plannedClockOutDate}T${plannedClockOut}:00`,
    );
    return plannedDateTime.getTime() > currentTime.getTime();
  };

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-medium text-gray-700">
        {UI_MESSAGES.CURRENT_STATUS}
      </h3>
      <div className="mb-6">
        <div className="mb-4 text-center">
          <p className="text-gray-600">{UI_MESSAGES.CURRENT_TIME}</p>
          {currentTime && (
            <>
              <p className="text-2xl font-bold">{formatTime(currentTime)}</p>
              <p className="text-gray-500">{formatDate(currentTime)}</p>
            </>
          )}
        </div>

        {status === "clocked-in" && lastClockIn && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">
                  {UI_MESSAGES.CURRENTLY_WORKING}
                </p>
                <p className="text-green-600">
                  {UI_MESSAGES.START_TIME}: {formatTime(lastClockIn)} (
                  {calculateDuration(lastClockIn)})
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        {status === "idle" && (
          <div className="mb-4 w-full max-w-[340px]">
            <label
              htmlFor="plannedClockOut"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              予定退勤時間
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                id="plannedClockOutDate"
                value={plannedClockOutDate}
                onChange={handleDateChange}
                min={currentTime ? currentTime.toISOString().split("T")[0] : ""}
                className="w-[180px] rounded-md border-gray-300 py-1.5 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
                ref={dateInputRef}
              />
              <div className="relative flex-1">
                <input
                  type="time"
                  id="plannedClockOut"
                  value={plannedClockOut}
                  onChange={handleTimeChange}
                  className={`block w-full rounded-md py-1.5 pr-14 text-gray-700 shadow-sm focus:ring-indigo-500 sm:text-sm ${
                    isValidTime
                      ? "border-gray-300 focus:border-indigo-500"
                      : "border-red-300 focus:border-red-500"
                  }`}
                  required
                  ref={timeInputRef}
                />
                {plannedClockOut && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <span className="text-xs tabular-nums text-gray-500">
                      {formatDuration(
                        parseInt(calculatePlannedDuration(plannedClockOut)) /
                          60,
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <label
                htmlFor="breakMinutes"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                休憩時間
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={breakMinutes}
                  onChange={() => {
                    if (!breakInputRef.current) return;
                    const value = Math.min(
                      999,
                      Math.max(
                        0,
                        parseInt(breakInputRef.current.value || "0") || 0,
                      ),
                    );
                    handleBreakMinutesChange(value);
                  }}
                  className={`w-20 rounded-md border-gray-300 text-center text-sm`}
                  placeholder="0"
                  ref={breakInputRef}
                />
                <span className="text-sm text-gray-500">分</span>
              </div>
            </div>
            <p className="mt-1 text-sm">
              {!isValidTime && timeError ? (
                <span className="text-red-600">{timeError}</span>
              ) : (
                <span className="text-xs text-gray-500">
                  未入力時は約8時間で自動設定
                </span>
              )}
            </p>
          </div>
        )}

        <button
          type="button"
          className={`mx-auto max-w-[200px] rounded-md px-4 py-2 text-sm font-medium text-white ${
            !isValidTime ||
            !plannedClockOut ||
            !isPlannedTimeValid() ||
            hasActiveRecord ||
            isLoading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          onClick={() => {
            console.log("[Debug] Button disabled state:", {
              isValidTime,
              plannedClockOut,
              isPlannedTimeValid: isPlannedTimeValid(),
              hasActiveRecord,
              isLoading,
            });
            onClockAction(
              CLOCK_ACTIONS.IN,
              `${plannedClockOutDate}T${plannedClockOut}`,
            );
          }}
          disabled={
            !isValidTime ||
            !plannedClockOut ||
            !isPlannedTimeValid() ||
            hasActiveRecord ||
            isLoading
          }
          title={
            hasActiveRecord
              ? "進行中の勤怠記録があるため、新しく出勤することはできません"
              : isLoading
                ? "読み込み中..."
                : !isValidTime
                  ? timeError
                  : undefined
          }
        >
          {isLoading ? "読み込み中..." : UI_MESSAGES.CLOCK_IN}
        </button>
      </div>
    </div>
  );
}
