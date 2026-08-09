export type InquiryStatus = "New" | "Contacted" | "Converted" | "Lost";

const styles: Record<InquiryStatus, string> = {
  New: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Contacted: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Converted: "bg-green-500/15 text-green-600 dark:text-green-400",
  Lost: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function StatusBadge({ status }: { status: InquiryStatus }) {
  const defaultStyle = "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || defaultStyle}`}
    >
      {status}
    </span>
  );
}
