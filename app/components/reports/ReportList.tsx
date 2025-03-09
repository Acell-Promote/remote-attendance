"use client";

import { useState } from "react";
import { type ReportWithRelations } from "@/app/types/report";
import { formatSimpleDate } from "@/lib/report-display-utils";
import StatusBadge from "../common/StatusBadge";
import Pagination from "../common/Pagination";

interface User {
  name: string | null;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface Report {
  id: string;
  date: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  reviewer?: User;
  comments: Comment[];
}

interface ReportListProps {
  reports: ReportWithRelations[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onReportClick: (report: ReportWithRelations) => void;
}

type SortField = "date" | "status";
type SortDirection = "asc" | "desc";

export default function ReportList({
  reports,
  total,
  currentPage,
  onPageChange,
  onReportClick,
}: ReportListProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedReports = [...reports].sort((a, b) => {
    if (sortField === "date") {
      const dateA = a.date || a.createdAt;
      const dateB = b.date || b.createdAt;
      return sortDirection === "asc"
        ? new Date(dateA).getTime() - new Date(dateB).getTime()
        : new Date(dateB).getTime() - new Date(dateA).getTime();
    } else {
      return sortDirection === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortHeader = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
      )}
    </th>
  );

  return (
    <div>
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader field="date" label="日付" />
              <SortHeader field="status" label="ステータス" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                コメント
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最終更新
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedReports.map((report) => (
              <tr
                key={report.id}
                onClick={() => onReportClick(report)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatSimpleDate(report.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.comments.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(report.updatedAt).toLocaleString("ja-JP")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > reports.length && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                全{total}件中 {(currentPage - 1) * reports.length + 1}-
                {Math.min(currentPage * reports.length, total)}件を表示
              </p>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(total / reports.length)}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
