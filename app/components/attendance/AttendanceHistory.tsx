import { useState, useMemo } from "react";
import {
  formatDateTime,
  calculateDuration,
  formatToJSTDateTimeLocal,
  convertJSTtoUTC,
} from "@/lib/date-utils";
import { ATTENDANCE } from "@/lib/constants/attendance";
import {
  AttendanceHistoryState,
  AttendanceRecord,
} from "@/app/types/attendance";
import Pagination from "../common/Pagination";

/**
 * Component for displaying and managing attendance history records
 * Includes filtering, editing, and pagination functionality
 */
interface AttendanceHistoryProps {
  historyState: AttendanceHistoryState;
  selectedMonth: Date;
  onMonthChange: (newMonth: Date) => void;
  onPageChange: (page: number) => void;
  onEdit?: (record: AttendanceRecord) => void;
  onDelete?: (record: AttendanceRecord) => void;
  onApprovePlannedClockOut?: (record: AttendanceRecord) => void;
}

export default function AttendanceHistory({
  historyState,
  selectedMonth,
  onMonthChange,
  onPageChange,
  onEdit,
  onDelete,
  onApprovePlannedClockOut,
}: AttendanceHistoryProps) {
  const { UI_MESSAGES, TABLE_HEADERS, RECORDS_PER_PAGE, STATUS_LABELS } =
    ATTENDANCE;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    clockIn: string;
    clockOut: string | null;
    plannedClockOut: string;
    breakMinutes: number;
    error?: string;
  } | null>(null);

  const { records = [], loading, error, currentPage = 1 } = historyState;

  // Filter records for the selected month
  const filteredRecords = useMemo(() => {
    return (records || []).filter((record) => {
      const recordDate = new Date(record.clockIn);
      return (
        recordDate.getFullYear() === selectedMonth.getFullYear() &&
        recordDate.getMonth() === selectedMonth.getMonth()
      );
    });
  }, [records, selectedMonth]);

  const totalPages = Math.ceil(
    (filteredRecords?.length || 0) / RECORDS_PER_PAGE,
  );
  const currentRecords = useMemo(() => {
    return (filteredRecords || []).slice(
      (currentPage - 1) * RECORDS_PER_PAGE,
      currentPage * RECORDS_PER_PAGE,
    );
  }, [filteredRecords, currentPage, RECORDS_PER_PAGE]);

  const handleEditClick = (record: AttendanceRecord) => {
    try {
      const clockIn = formatToJSTDateTimeLocal(new Date(record.clockIn));
      const clockOut = record.clockOut
        ? formatToJSTDateTimeLocal(new Date(record.clockOut))
        : null;
      const plannedClockOut = formatToJSTDateTimeLocal(
        new Date(record.plannedClockOut),
      );

      // Ensure we have valid datetime strings
      if (!clockIn || !plannedClockOut) {
        throw new Error("Invalid datetime values");
      }

      const editData = {
        clockIn,
        clockOut,
        plannedClockOut,
        breakMinutes: record.breakMinutes || 0,
      };
      setEditingId(record.id);
      setEditData(editData);
    } catch (error) {
      console.error("Edit initialization failed:", error);
      alert("編集の初期化に失敗しました");
    }
  };

  const validateEditTimes = (
    clockIn: string,
    clockOut: string | null,
    plannedClockOut: string,
  ) => {
    try {
      const clockInTime = new Date(clockIn);
      const plannedTime = new Date(plannedClockOut);

      // Validate planned clock out time
      if (plannedTime <= clockInTime) {
        return {
          isValid: false,
          error: "予定退勤時間は出勤時間より後に設定してください",
        };
      }

      // Validate actual clock out time if present
      if (clockOut) {
        const clockOutTime = new Date(clockOut);
        if (clockOutTime <= clockInTime) {
          return {
            isValid: false,
            error: "退勤時間は出勤時間より後に設定してください",
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      console.error("Edit time validation failed:", error);
      return {
        isValid: false,
        error: "日時の検証に失敗しました",
      };
    }
  };

  const handleEditDataChange = (
    field: "clockIn" | "clockOut" | "plannedClockOut" | "breakMinutes",
    value: string | number,
  ) => {
    setEditData((prev) => {
      if (!prev) return prev;

      const newData = { ...prev };

      if (field === "breakMinutes") {
        // Handle empty string case
        if (value === "") {
          newData.breakMinutes = 0;
        } else {
          const numValue = parseInt(value.toString());
          // Only update if it's a valid number and within range
          if (!isNaN(numValue)) {
            newData.breakMinutes = Math.min(999, Math.max(0, numValue));

            // Validate break minutes against work duration
            const clockIn = new Date(newData.clockIn);
            const clockOut = newData.clockOut
              ? new Date(newData.clockOut)
              : null;
            if (clockOut) {
              const workDurationMinutes = Math.floor(
                (clockOut.getTime() - clockIn.getTime()) / (1000 * 60),
              );
              if (newData.breakMinutes >= workDurationMinutes) {
                newData.error = "休憩時間は勤務時間を超えることはできません";
              }
            }
          }
        }
      } else {
        newData[field] = value.toString();
      }

      // Validate times when any time field changes
      if (["clockIn", "clockOut", "plannedClockOut"].includes(field)) {
        const validation = validateEditTimes(
          newData.clockIn,
          newData.clockOut,
          newData.plannedClockOut,
        );
        newData.error = validation.isValid ? undefined : validation.error;
      }

      return newData;
    });
  };

  const handleSave = async (record: AttendanceRecord) => {
    if (!editData) return;
    if (editData.error) return;

    try {
      // Confirm if editing an active session
      if (
        record.is_active &&
        !window.confirm("現在進行中の勤怠記録を編集しますか？")
      ) {
        return;
      }

      // Convert JST datetime strings to UTC ISO strings
      const clockInJST = new Date(editData.clockIn);
      const clockOutJST = editData.clockOut
        ? new Date(editData.clockOut)
        : null;
      const plannedClockOutJST = new Date(editData.plannedClockOut);

      // Validate work duration
      if (clockOutJST) {
        const workDurationHours =
          (clockOutJST.getTime() - clockInJST.getTime()) / (1000 * 60 * 60);
        if (workDurationHours > 24) {
          throw new Error("勤務時間は24時間を超えることはできません");
        }
      }

      // Convert JST to UTC using utility function
      const clockInUTC = convertJSTtoUTC(clockInJST);
      const clockOutUTC = clockOutJST ? convertJSTtoUTC(clockOutJST) : null;
      const plannedClockOutUTC = convertJSTtoUTC(plannedClockOutJST);

      if (!clockInUTC || !plannedClockOutUTC) {
        throw new Error("時間の変換に失敗しました");
      }

      const updatedRecord = {
        ...record,
        clockIn: clockInUTC.toISOString(),
        clockOut: clockOutUTC?.toISOString() || null,
        plannedClockOut: plannedClockOutUTC.toISOString(),
        breakMinutes: parseInt(String(editData.breakMinutes || 0)),
        is_active: !clockOutUTC,
      };

      await onEdit?.(updatedRecord);
      setEditingId(null);
      setEditData(null);
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "保存に失敗しました");
    }
  };

  const handleCancel = () => {
    if (window.confirm("編集をキャンセルしてもよろしいですか？")) {
      setEditingId(null);
      setEditData(null);
    }
  };

  const handleDelete = async (record: AttendanceRecord) => {
    try {
      // Additional confirmation for active records
      if (record.is_active) {
        if (
          !window.confirm(
            "現在進行中の勤怠記録を削除しますか？\nこの操作は取り消せません。",
          )
        ) {
          return;
        }
      } else if (!window.confirm("この勤怠記録を削除してもよろしいですか？")) {
        return;
      }

      await onDelete?.(record);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("削除に失敗しました");
    }
  };

  const handleApprovePlannedClockOut = async (record: AttendanceRecord) => {
    try {
      if (!record.plannedClockOut) {
        throw new Error("予定退勤時間が設定されていません");
      }

      const plannedTime = new Date(record.plannedClockOut);
      const currentTime = new Date();

      // Don't allow approval of future planned times
      if (plannedTime > currentTime) {
        throw new Error("予定退勤時間はまだ到達していません");
      }

      if (!window.confirm("予定退勤時間を実際の退勤時間として承認しますか？")) {
        return;
      }

      await onApprovePlannedClockOut?.(record);
    } catch (error) {
      console.error("Approve planned clock out failed:", error);
      alert(error instanceof Error ? error.message : "承認に失敗しました");
    }
  };

  const getStatus = (record: AttendanceRecord) => {
    if (record.is_active) {
      return STATUS_LABELS.IN_PROGRESS;
    }
    return STATUS_LABELS.COMPLETED;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case STATUS_LABELS.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case STATUS_LABELS.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "";
    }
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
  };

  const handlePreviousMonth = () => {
    onMonthChange(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth.getTime() <= new Date().getTime()) {
      onMonthChange(nextMonth);
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">
          {UI_MESSAGES.HISTORY_TITLE}
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousMonth}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
          >
            ←
          </button>
          <span className="min-w-[120px] text-center font-medium">
            {formatMonth(selectedMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            disabled={
              new Date(
                selectedMonth.getFullYear(),
                selectedMonth.getMonth() + 1,
                1,
              ) > new Date()
            }
          >
            →
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
          <p className="ml-2 text-gray-600">{UI_MESSAGES.LOADING_HISTORY}</p>
        </div>
      ) : !filteredRecords?.length ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">{UI_MESSAGES.NO_RECORDS}</p>
        </div>
      ) : (
        <>
          <div className="relative overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.values(TABLE_HEADERS).map((header) => (
                    <th
                      key={header}
                      className={`px-4 py-3 text-center text-xs font-medium text-gray-500 ${
                        header === "出勤時間" || header === "退勤時間"
                          ? "w-[200px]"
                          : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentRecords.map((record) => {
                  const isEditing = editingId === record.id;
                  const status = getStatus(record);
                  const statusStyle = getStatusStyle(status);

                  return (
                    <tr key={record.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                        {isEditing ? (
                          <input
                            type="datetime-local"
                            value={editData?.clockIn || ""}
                            onChange={(e) =>
                              handleEditDataChange("clockIn", e.target.value)
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        ) : (
                          formatDateTime(record.clockIn)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                        {isEditing ? (
                          <div className="flex flex-col space-y-2">
                            {!record.clockOut ? (
                              <input
                                type="datetime-local"
                                value={editData?.plannedClockOut || ""}
                                onChange={(e) =>
                                  handleEditDataChange(
                                    "plannedClockOut",
                                    e.target.value,
                                  )
                                }
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            ) : (
                              <input
                                type="datetime-local"
                                value={editData?.clockOut || ""}
                                onChange={(e) =>
                                  handleEditDataChange(
                                    "clockOut",
                                    e.target.value,
                                  )
                                }
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            {record.clockOut || !record.is_active ? (
                              formatDateTime(
                                record.clockOut || record.plannedClockOut,
                              )
                            ) : (
                              <>
                                <span className="text-gray-400">
                                  {formatDateTime(record.plannedClockOut)}
                                </span>
                                {record.is_active && (
                                  <span className="text-xs text-gray-400">
                                    (予定)
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={editData?.breakMinutes || 0}
                            onChange={(e) =>
                              handleEditDataChange(
                                "breakMinutes",
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        ) : (
                          `${record.breakMinutes || 0}分`
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                        {calculateDuration(
                          new Date(record.clockIn),
                          record.clockOut ? new Date(record.clockOut) : null,
                          record.breakMinutes,
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyle}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                        {isEditing ? (
                          <div className="flex flex-col space-y-2">
                            {editData?.error && (
                              <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-center">
                                <p className="text-xs text-red-600">
                                  {editData.error}
                                </p>
                              </div>
                            )}
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleSave(record)}
                                disabled={!!editData?.error}
                                className={`rounded px-2 py-1 text-xs font-medium ${
                                  editData?.error
                                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                                    : "bg-green-100 text-green-800 hover:bg-green-200"
                                }`}
                              >
                                保存
                              </button>
                              <button
                                onClick={handleCancel}
                                className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-200"
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center space-x-2">
                            {!record.clockOut && record.plannedClockOut && (
                              <button
                                onClick={() =>
                                  handleApprovePlannedClockOut(record)
                                }
                                className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                                title="予定退勤時間を実際の退勤時間として承認します"
                              >
                                予定時間を承認
                              </button>
                            )}
                            <button
                              onClick={() => handleEditClick(record)}
                              className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-200"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(record)}
                              className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                            >
                              削除
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}
