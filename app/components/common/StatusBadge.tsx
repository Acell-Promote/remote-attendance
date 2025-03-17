import { getStatusColor, getStatusText } from "@/lib/report-display-utils";
import { ReportStatus } from "@/app/types/report";

interface StatusBadgeProps {
  status: ReportStatus | string;
  className?: string;
}

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
        status,
      )} ${className}`}
    >
      {getStatusText(status)}
    </span>
  );
}
