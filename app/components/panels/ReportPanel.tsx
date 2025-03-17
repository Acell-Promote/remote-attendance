"use client";

import { useState, useEffect, useCallback } from "react";
import ReportEditor from "../reports/ReportEditor";
import ReportList from "../reports/ReportList";
import ReportViewer from "../reports/ReportViewer";
import { ApiResponse, PaginatedResponse } from "@/app/types/api";
import { ReportWithRelations, ReportFormData } from "@/app/types/report";
import { ReportStatus } from "@/app/types/report";
import { apiRequest } from "@/lib/api-client";

export default function ReportPanel() {
  const [view, setView] = useState<"list" | "editor" | "viewer">("list");
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [selectedReport, setSelectedReport] =
    useState<ReportWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<
        ApiResponse<PaginatedResponse<ReportWithRelations>>
      >(`/api/reports?page=${page}`);
      if (response.data) {
        setReports(response.data.reports);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setError("レポートの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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
    console.log("Adding comment to report:", {
      reportId: selectedReport.id,
      content,
    });

    try {
      await apiRequest(`/api/reports/${selectedReport.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      // Refresh the selected report
      console.log("Refreshing report after comment:", selectedReport.id);
      const reportData = await apiRequest<ApiResponse<ReportWithRelations>>(
        `/api/reports/${selectedReport.id}`,
      );
      if (reportData.data) {
        setSelectedReport(reportData.data);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
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
        },
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">日報管理</h2>
        {view === "list" ? (
          <button
            onClick={() => setView("editor")}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            新規作成
          </button>
        ) : (
          <button
            onClick={() => setView("list")}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
