import { useMemo } from "react";
import { AttendanceRecord } from "@/app/types/attendance";

interface WorkTimeAggregationProps {
  /**
   * List of attendance records to be aggregated
   * @default []
   */
  records: AttendanceRecord[];
  /**
   * Currently selected month for filtering records
   */
  selectedMonth: Date;
}

interface TimeAggregation {
  /**
   * Total working hours for the period
   */
  totalHours: number;
  /**
   * Number of attendance records in the period
   */
  recordCount: number;
  /**
   * Average working hours per day in the period
   */
  averageHoursPerDay: number;
}

/**
 * Creates a Date object for the start of the day
 *
 * @param date - Date to get start of day for
 * @returns Date object set to start of day
 */
const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Calculates time aggregation metrics from a list of attendance records
 *
 * @param records - List of attendance records to aggregate
 * @returns TimeAggregation object containing total hours, record count, and average hours per day
 */
const aggregateRecords = (records: AttendanceRecord[]): TimeAggregation => {
  const totalMinutes = records.reduce((total, record) => {
    if (!record.clockOut) return total;
    const clockIn = new Date(record.clockIn);
    const clockOut = new Date(record.clockOut);
    const duration = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
    return total + duration - (record.breakMinutes || 0);
  }, 0);

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const recordCount = records.length;
  const averageHoursPerDay =
    recordCount > 0 ? Math.round((totalHours / recordCount) * 10) / 10 : 0;

  return {
    totalHours,
    recordCount,
    averageHoursPerDay,
  };
};

/**
 * WorkTimeAggregation component displays aggregated work time statistics for different time periods
 * This component only shows the aggregation stats and month selector - the detailed records table
 * is handled by the AttendanceHistory component.
 */
export default function WorkTimeAggregation({
  records = [],
  selectedMonth,
}: WorkTimeAggregationProps) {
  // Calculate reference dates once and memoize
  const today = useMemo(() => getStartOfDay(new Date()), []);
  const weekStart = useMemo(() => {
    const start = getStartOfDay(new Date(today));
    start.setDate(today.getDate() - today.getDay());
    return start;
  }, [today]);

  // Memoize filtered records
  const filteredRecords = useMemo(
    () => ({
      daily: records.filter((record) => {
        const recordDate = getStartOfDay(new Date(record.clockIn));
        return recordDate.getTime() === today.getTime();
      }),
      weekly: records.filter((record) => {
        const recordDate = getStartOfDay(new Date(record.clockIn));
        return recordDate.getTime() >= weekStart.getTime();
      }),
      monthly: records.filter((record) => {
        const recordDate = new Date(record.clockIn);
        return (
          recordDate.getFullYear() === selectedMonth.getFullYear() &&
          recordDate.getMonth() === selectedMonth.getMonth()
        );
      }),
    }),
    [records, today, weekStart, selectedMonth],
  );

  // Memoize aggregated data
  const aggregatedData = useMemo(
    () => ({
      daily: aggregateRecords(filteredRecords.daily),
      weekly: aggregateRecords(filteredRecords.weekly),
      monthly: aggregateRecords(filteredRecords.monthly),
    }),
    [filteredRecords],
  );

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700">勤務時間集計</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-medium text-gray-600">本日</h4>
          <p className="text-2xl font-bold text-indigo-600">
            {formatHours(aggregatedData.daily.totalHours)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {aggregatedData.daily.recordCount}件の記録
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-medium text-gray-600">今週</h4>
          <p className="text-2xl font-bold text-indigo-600">
            {formatHours(aggregatedData.weekly.totalHours)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            平均: {formatHours(aggregatedData.weekly.averageHoursPerDay)}/日
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-medium text-gray-600">
            {selectedMonth.getMonth() === new Date().getMonth()
              ? "今月"
              : "選択月"}
          </h4>
          <p className="text-2xl font-bold text-indigo-600">
            {formatHours(aggregatedData.monthly.totalHours)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            平均: {formatHours(aggregatedData.monthly.averageHoursPerDay)}/日
          </p>
        </div>
      </div>
    </div>
  );
}
