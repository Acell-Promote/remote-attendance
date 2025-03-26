import { useState } from "react";
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

interface AttendanceHistoryProps {
  historyState: AttendanceHistoryState;
  onPageChange: (page: number) => void;
  onEdit?: (record: AttendanceRecord) => void;
  onDelete?: (record: AttendanceRecord) => void;
  onApprovePlannedClockOut?: (record: AttendanceRecord) => void;
}

export default function AttendanceHistory({
  historyState: { records, loading, error, currentPage },
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

  const totalPages = Math.ceil((records?.length || 0) / RECORDS_PER_PAGE);
  const currentRecords = (records || []).slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE,
  );

  const handleEditClick = (record: AttendanceRecord) => {
    const clockIn = formatToJSTDateTimeLocal(new Date(record.clockIn));
    const clockOut = record.clockOut
      ? formatToJSTDateTimeLocal(new Date(record.clockOut))
      : null;
    const plannedClockOut = formatToJSTDateTimeLocal(
      new Date(record.plannedClockOut),
    );

    // Ensure we have valid datetime strings
    if (!clockIn || !plannedClockOut) {
      console.error("Invalid datetime values:", { clockIn, plannedClockOut });
      return;
    }

    const editData = {
      clockIn,
      clockOut,
      plannedClockOut,
      breakMinutes: record.breakMinutes || 0,
    };
    setEditingId(record.id);
    setEditData(editData);
  };

  const validateEditTimes = (
    clockIn: string,
    clockOut: string | null,
    plannedClockOut: string,
  ) => {
    const clockInTime = new Date(clockIn);
    const plannedTime = new Date(plannedClockOut);

    if (clockOut) {
      const clockOutTime = new Date(clockOut);
      if (clockOutTime <= clockInTime) return false;
    }

    if (plannedTime <= clockInTime) return false;

    return true;
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
          // Only update if it's a valid number
          if (!isNaN(numValue)) {
            newData.breakMinutes = Math.min(999, Math.max(0, numValue));
          }
        }
      } else {
        newData[field] = value.toString();
      }

      // Validate times when any time field changes
      if (["clockIn", "clockOut", "plannedClockOut"].includes(field)) {
        const isValid = validateEditTimes(
          newData.clockIn,
          newData.clockOut,
          newData.plannedClockOut,
        );
        newData.error = isValid
          ? undefined
          : "退勤予定時間と退勤時間は出勤時間より後の時間にしてください";
      }

      return newData;
    });
  };

  const handleSave = (record: AttendanceRecord) => {
    if (!editData) return;
    if (editData.error) return; // Prevent saving if there's an error

    // Convert JST datetime strings to UTC ISO strings
    const clockInJST = new Date(editData.clockIn);
    const clockOutJST = editData.clockOut ? new Date(editData.clockOut) : null;
    const plannedClockOutJST = new Date(editData.plannedClockOut);

    // Convert JST to UTC using utility function
    const clockInUTC = convertJSTtoUTC(clockInJST);
    const clockOutUTC = convertJSTtoUTC(clockOutJST);
    const plannedClockOutUTC = convertJSTtoUTC(plannedClockOutJST);

    if (!clockInUTC || !plannedClockOutUTC) {
      console.error("Failed to convert times to UTC");
      return;
    }

    const updatedRecord = {
      ...record,
      clockIn: clockInUTC.toISOString(),
      clockOut: clockOutUTC?.toISOString() || null,
      plannedClockOut: plannedClockOutUTC.toISOString(),
      breakMinutes: parseInt(String(editData.breakMinutes || 0)),
      is_active: !clockOutUTC, // Set is_active based on clockOut
    };

    onEdit?.(updatedRecord);
    setEditingId(null);
    setEditData(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
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

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-semibold text-gray-800">
        {UI_MESSAGES.HISTORY_TITLE}
      </h3>

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
      ) : !records?.length ? (
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
                                  onApprovePlannedClockOut?.(record)
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
                              onClick={() => onDelete?.(record)}
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
