import { formatTime, formatDate, calculateDuration } from "@/lib/date-utils";
import { ATTENDANCE } from "@/lib/constants/attendance";
import { AttendanceState } from "@/app/types/attendance";

interface CurrentStatusProps {
  currentTime: Date | null;
  attendanceState: AttendanceState;
  onClockAction: (
    action: (typeof ATTENDANCE.CLOCK_ACTIONS)[keyof typeof ATTENDANCE.CLOCK_ACTIONS]
  ) => void;
}

export default function CurrentStatus({
  currentTime,
  attendanceState: { status, lastClockIn, error },
  onClockAction,
}: CurrentStatusProps) {
  const { UI_MESSAGES, CLOCK_ACTIONS } = ATTENDANCE;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        {UI_MESSAGES.CURRENT_STATUS}
      </h3>
      <div className="mb-6">
        <div className="text-center mb-4">
          <p className="text-gray-600">{UI_MESSAGES.CURRENT_TIME}</p>
          {currentTime && (
            <>
              <p className="text-2xl font-bold">{formatTime(currentTime)}</p>
              <p className="text-gray-500">{formatDate(currentTime)}</p>
            </>
          )}
        </div>

        {status === "clocked-in" && lastClockIn && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-800 font-medium">
              {UI_MESSAGES.CURRENTLY_WORKING}
            </p>
            <p className="text-green-600">
              {UI_MESSAGES.START_TIME}: {formatTime(lastClockIn)} (
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
            onClockAction(
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
            ? UI_MESSAGES.LOADING
            : status === "idle"
            ? UI_MESSAGES.CLOCK_IN
            : UI_MESSAGES.CLOCK_OUT}
        </button>
      </div>
    </div>
  );
}
