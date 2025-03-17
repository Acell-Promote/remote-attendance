import { formatTime, formatDate, calculateDuration } from "@/lib/date-utils";
import { ATTENDANCE } from "@/lib/constants/attendance";
import { AttendanceState } from "@/app/types/attendance";

interface CurrentStatusProps {
  currentTime: Date | null;
  attendanceState: AttendanceState;
  onClockAction: (
    action: (typeof ATTENDANCE.CLOCK_ACTIONS)[keyof typeof ATTENDANCE.CLOCK_ACTIONS],
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
            <p className="font-medium text-green-800">
              {UI_MESSAGES.CURRENTLY_WORKING}
            </p>
            <p className="text-green-600">
              {UI_MESSAGES.START_TIME}: {formatTime(lastClockIn)} (
              {calculateDuration(lastClockIn)})
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() =>
            onClockAction(
              status === "idle" ? CLOCK_ACTIONS.IN : CLOCK_ACTIONS.OUT,
            )
          }
          disabled={status === "loading"}
          className={`rounded-md px-6 py-3 font-medium disabled:opacity-50 ${
            status === "idle"
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-red-600 text-white hover:bg-red-700"
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
