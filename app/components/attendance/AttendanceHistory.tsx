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
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <div className="mt-10 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        {UI_MESSAGES.HISTORY_TITLE}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-2 text-gray-600">{UI_MESSAGES.LOADING_HISTORY}</p>
        </div>
      ) : !records?.length ? (
        <div className="text-center py-8">
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.clockIn).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(record.clockIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.clockOut ? formatDateTime(record.clockOut) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.clockOut
                        ? calculateDuration(
                            new Date(record.clockIn),
                            new Date(record.clockOut)
                          )
                        : STATUS_LABELS.IN_PROGRESS}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
