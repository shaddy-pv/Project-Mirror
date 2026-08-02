import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAP: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-neutral-soft text-muted-foreground" },
  pending: { label: "Waiting for approval", className: "bg-warning-soft text-warning" },
  live: { label: "Live", className: "bg-success-soft text-success" },
  published: { label: "Published", className: "bg-success-soft text-success" },
  selected: { label: "Selected", className: "bg-success-soft text-success" },
  rejected: { label: "Sent back", className: "bg-danger-soft text-danger" },
  expired: { label: "Expired", className: "bg-danger-soft text-danger" },
  closed: { label: "Closed", className: "bg-danger-soft text-danger" },
  archived: { label: "Archived", className: "bg-neutral-soft text-muted-foreground" },
  active: { label: "Active", className: "bg-success-soft text-success" },
  deactivated: { label: "Deactivated", className: "bg-neutral-soft text-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = MAP[status] ?? {
    label: status,
    className: "bg-neutral-soft text-muted-foreground",
  };
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", entry.className, className)}
    >
      {entry.label}
    </Badge>
  );
}
