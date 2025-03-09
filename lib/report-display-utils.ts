import { ReportStatus } from "@/app/types/report";

export function formatReportDate(
  dateString: string | undefined | Date
): string {
  if (!dateString) return "";
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusText(status: ReportStatus | string): string {
  switch (status) {
    case ReportStatus.DRAFT:
      return "下書き";
    case ReportStatus.SUBMITTED:
      return "提出済み";
    case ReportStatus.REVIEWED:
      return "確認済み";
    default:
      return status;
  }
}

export function getStatusColor(status: ReportStatus | string): string {
  switch (status) {
    case ReportStatus.DRAFT:
      return "bg-gray-100 text-gray-800";
    case ReportStatus.SUBMITTED:
      return "bg-blue-100 text-blue-800";
    case ReportStatus.REVIEWED:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function formatSimpleDate(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
