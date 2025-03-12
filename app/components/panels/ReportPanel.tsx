"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReportEditor from "../reports/ReportEditor";
import ReportList from "../reports/ReportList";
import ReportViewer from "../reports/ReportViewer";
import { ApiResponse, PaginatedResponse } from "@/app/types/api";
import type { ReportWithRelations } from "@/app/types/report";
import { ReportStatus } from "@/app/types/report";
import { apiRequest } from "@/lib/api-client";

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

interface ReportFormData {
  title: string;
  date: string;
  content: string;
  status: ReportStatus;
}

// Constants
const REPORTS_PER_PAGE = 10;

export default function ReportPanel() {
  const { data: session } = useSession();
  const [view, setView] = useState<"list" | "editor" | "viewer">("list");
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [selectedReport, setSelectedReport] =
    useState<ReportWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Fetching reports...");
      const response = await apiRequest<
        ApiResponse<PaginatedResponse<ReportWithRelations>>
      >("/api/reports", {
        params: { page, limit: REPORTS_PER_PAGE },
      });
      console.log("Reports received:", response);
      if (response.data) {
        setReports(response.data.reports || []);
        setTotal(response.data.total || 0);
      } else {
        console.error("No data in response:", response);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, fetchReports]);

  const handleCreateReport = async (data: ReportFormData) => {
    try {
      await apiRequest<ApiResponse<ReportWithRelations>>("/api/reports", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setView("list");
      fetchReports();
    } catch (error) {
      throw error;
    }
  };

  const handleSaveDraft = async (data: ReportFormData) => {
    try {
      await apiRequest<ApiResponse<ReportWithRelations>>("/api/reports", {
        method: "POST",
        body: JSON.stringify({ ...data, status: ReportStatus.DRAFT }),
      });
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!selectedReport) return;

    try {
      await apiRequest(`/api/reports/${selectedReport.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      // Refresh the selected report
      const reportData = await apiRequest<ApiResponse<ReportWithRelations>>(
        `/api/reports/${selectedReport.id}`
      );
      if (reportData.data) {
        setSelectedReport(reportData.data);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleStatusChange = async (status: ReportStatus) => {
    if (!selectedReport) return;

    try {
      const result = await apiRequest<ApiResponse<ReportWithRelations>>(
        `/api/reports/${selectedReport.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            id: selectedReport.id,
            status,
            content: selectedReport.content,
            title: selectedReport.title,
          }),
        }
      );
      if (result.data) {
        setSelectedReport(result.data);
        fetchReports();
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">日報管理</h2>
        {view === "list" ? (
          <button
            onClick={() => setView("editor")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            新規作成
          </button>
        ) : (
          <button
            onClick={() => setView("list")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            一覧に戻る
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      ) : (
        <>
          {view === "list" && (
            <ReportList
              reports={reports}
              total={total}
              currentPage={page}
              onPageChange={setPage}
              onReportClick={(report) => {
                setSelectedReport(report);
                setView("viewer");
              }}
            />
          )}

          {view === "editor" && (
            <ReportEditor
              onSubmit={async (data) => {
                await handleCreateReport({
                  ...data,
                  status: ReportStatus.SUBMITTED,
                });
              }}
              onSaveDraft={handleSaveDraft}
            />
          )}

          {view === "viewer" && selectedReport && (
            <ReportViewer
              report={selectedReport}
              onAddComment={handleAddComment}
              onStatusChange={handleStatusChange}
            />
          )}
        </>
      )}
    </div>
  );
}
