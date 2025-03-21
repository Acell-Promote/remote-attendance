"use client";

import { useState } from "react";
import { type ReportWithRelations } from "@/app/types/report";
import { formatSimpleDate } from "@/lib/report-display-utils";
import StatusBadge from "../common/StatusBadge";
import Pagination from "../common/Pagination";

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
      className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
      )}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <SortHeader field="date" label="日付" />
              <SortHeader field="status" label="ステータス" />
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                コメント
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                最終更新
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedReports.map((report) => (
              <tr
                key={report.id}
                onClick={() => onReportClick(report)}
                className="group cursor-pointer transition-all duration-150 ease-in-out hover:bg-indigo-50/60"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 transition-colors duration-150 group-hover:text-indigo-600">
                      {formatSimpleDate(report.date)}
                    </span>
                    <span className="mt-1 line-clamp-1 text-xs text-gray-500 transition-colors duration-150 group-hover:text-gray-600">
                      {report.title}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge status={report.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center space-x-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-400 transition-colors duration-150 group-hover:text-indigo-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-gray-600 transition-colors duration-150 group-hover:text-indigo-600">
                      {report.comments.length}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 transition-colors duration-150 group-hover:text-indigo-600">
                      {new Date(report.updatedAt).toLocaleString("ja-JP")}
                    </span>
                    <span className="mt-1 text-xs text-gray-500 transition-colors duration-150 group-hover:text-gray-600">
                      {report.user.name || report.user.email}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="inline-flex translate-x-[-8px] transform items-center text-indigo-600 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                    <span className="font-medium">詳細を見る</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1.5 h-3 w-3 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > reports.length && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200 sm:rounded-lg sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                全<span className="font-medium">{total}</span>件中{" "}
                <span className="font-medium">
                  {(currentPage - 1) * reports.length + 1}
                </span>
                -
                <span className="font-medium">
                  {Math.min(currentPage * reports.length, total)}
                </span>
                件を表示
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
