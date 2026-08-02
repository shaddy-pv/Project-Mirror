import type { InquiryStatus } from "@/lib/sales-data";

const styles: Record<InquiryStatus, string> = {
  New: "bg-muted text-muted-foreground",
  Responded: "bg-warning/15 text-warning",
  Closed: "bg-primary/12 text-primary",
};

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
