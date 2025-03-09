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
    <div className="space-y-4">
      <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <SortHeader field="date" label="日付" />
              <SortHeader field="status" label="ステータス" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                コメント
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最終更新
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedReports.map((report) => (
              <tr
                key={report.id}
                onClick={() => onReportClick(report)}
                className="group hover:bg-indigo-50/60 cursor-pointer transition-all duration-150 ease-in-out"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-150">
                      {formatSimpleDate(report.date)}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 line-clamp-1 group-hover:text-gray-600 transition-colors duration-150">
                      {report.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-400 group-hover:text-indigo-400 transition-colors duration-150"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-gray-600 group-hover:text-indigo-600 transition-colors duration-150">
                      {report.comments.length}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors duration-150">
                      {new Date(report.updatedAt).toLocaleString("ja-JP")}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-150">
                      {report.user.name || report.user.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="inline-flex items-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out transform translate-x-[-8px] group-hover:translate-x-0">
                    <span className="font-medium">詳細を見る</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 ml-1.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
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
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:rounded-lg sm:px-6 shadow-sm ring-1 ring-gray-200">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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
