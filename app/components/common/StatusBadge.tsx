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
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
        status
      )} ${className}`}
    >
      {getStatusText(status)}
    </span>
  );
}
