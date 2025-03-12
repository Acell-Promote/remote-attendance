"use client";

import { useState } from "react";
import { ReportStatus, type ReportWithRelations } from "@/app/types/report";
import { formatReportDate } from "@/lib/report-display-utils";
import StatusBadge from "../common/StatusBadge";

interface ReportViewerProps {
  report: ReportWithRelations;
  onAddComment: (content: string) => Promise<void>;
  onStatusChange: (status: ReportStatus) => Promise<void>;
}

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

function CommentForm({ onSubmit, disabled = false }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div>
        <label htmlFor="comment" className="sr-only">
          コメントを追加
        </label>
        <textarea
          id="comment"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="コメントを入力..."
          disabled={disabled}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={submitting || !content.trim() || disabled}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {submitting ? "送信中..." : "コメントを送信"}
        </button>
      </div>
    </form>
  );
}

function CommentList({
  comments,
}: {
  comments: ReportWithRelations["comments"];
}) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {comment.user.name || comment.user.email}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-700">{comment.content}</div>
            <div className="mt-2 text-xs text-gray-500">
              {formatReportDate(comment.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReportViewer({
  report,
  onAddComment,
  onStatusChange,
}: ReportViewerProps) {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {report.title}
            </h3>
            <div className="mt-2 flex items-center space-x-4">
              <StatusBadge status={report.status} />
              <span className="text-sm text-gray-500">
                {formatReportDate(report.date || report.createdAt)}
              </span>
              <span className="text-sm text-gray-500">
                作成者: {report.user.name || report.user.email}
              </span>
            </div>
          </div>

          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap">{report.content}</pre>
          </div>

          {report.status === ReportStatus.SUBMITTED && (
            <div className="flex justify-end">
              <button
                onClick={() => onStatusChange(ReportStatus.REVIEWED)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                確認済みにする
              </button>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900">コメント</h4>
            <div className="mt-6">
              <CommentList comments={report.comments} />
              <CommentForm onSubmit={onAddComment} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
