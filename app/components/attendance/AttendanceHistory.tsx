import { formatDateTime, calculateDuration } from "@/lib/date-utils";
import { ATTENDANCE } from "@/lib/constants/attendance";
import { AttendanceHistoryState } from "@/app/types/attendance";
import Pagination from "../common/Pagination";

interface AttendanceHistoryProps {
  historyState: AttendanceHistoryState;
  onPageChange: (page: number) => void;
}

export default function AttendanceHistory({
  historyState: { records, loading, error, currentPage },
  onPageChange,
}: AttendanceHistoryProps) {
  const { UI_MESSAGES, TABLE_HEADERS, STATUS_LABELS, RECORDS_PER_PAGE } =
    ATTENDANCE;

  const totalPages = Math.ceil((records?.length || 0) / RECORDS_PER_PAGE);
  const currentRecords = (records || []).slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE,
  );

  return (
    <div className="mt-10 border-t border-gray-200 pt-6">
      <h3 className="mb-4 text-lg font-medium text-gray-700">
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.values(TABLE_HEADERS).map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(record.clockIn).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(record.clockIn)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {record.clockOut ? formatDateTime(record.clockOut) : "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {record.clockOut
                        ? calculateDuration(
                            new Date(record.clockIn),
                            new Date(record.clockOut),
                          )
                        : STATUS_LABELS.IN_PROGRESS}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          record.clockOut
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.clockOut
                          ? STATUS_LABELS.COMPLETED
                          : STATUS_LABELS.IN_PROGRESS}
                      </span>
                    </td>
                  </tr>
                ))}
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
