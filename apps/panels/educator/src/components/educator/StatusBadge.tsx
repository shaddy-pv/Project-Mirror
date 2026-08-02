import { cn } from "@/lib/utils";
import type { BlogStatus, Status } from "@/lib/mock/types";

const map: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-secondary text-secondary-foreground border-border" },
  pending: { label: "Pending approval", className: "bg-warning-soft text-warning border-warning/30" },
  live: { label: "Live", className: "bg-success-soft text-success border-success/30" },
  published: { label: "Published", className: "bg-success-soft text-success border-success/30" },
  rejected: { label: "Rejected", className: "bg-danger-soft text-destructive border-destructive/30" },
  archived: { label: "Archived", className: "bg-danger-soft text-destructive border-destructive/30" },
};

export function StatusBadge({ status, className }: { status: Status | BlogStatus; className?: string }) {
  const s = map[status] ?? map["draft"]!;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        s.className,
        className,
      )}
    >
      {s.label}
    </span>
  );
}
