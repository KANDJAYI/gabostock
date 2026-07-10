import {
  DOCUMENT_STATUS_LABELS,
  type ProDocumentStatus,
} from "@/lib/features/pro/documents/types";
import { cn } from "@/lib/utils/cn";

const STYLES: Record<ProDocumentStatus, string> = {
  draft: "bg-neutral-100 text-neutral-600 border-neutral-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-violet-50 text-violet-700 border-violet-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: ProDocumentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        STYLES[status],
      )}
    >
      {DOCUMENT_STATUS_LABELS[status]}
    </span>
  );
}
