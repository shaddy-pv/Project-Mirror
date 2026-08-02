import { cn } from "@/lib/utils";

type Tone = "gray" | "amber" | "green" | "red";

const TONES: Record<string, Tone> = {
  Draft: "gray",
  Pending: "amber",
  "Pending approval": "amber",
  Open: "green",
  Live: "green",
  Published: "green",
  Selected: "green",
  Responded: "green",
  Shortlisted: "amber",
  OA: "amber",
  Applied: "gray",
  New: "amber",
  Closed: "red",
  Expired: "red",
  Rejected: "red",
};

const toneClass: Record<Tone, string> = {
  gray: "bg-neutral-soft text-muted-foreground border-border",
  amber: "bg-pending-soft text-pending border-pending/25",
  green: "bg-brand-soft text-brand border-brand/25",
  red: "bg-danger-soft text-danger border-danger/25",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = TONES[status] ?? "gray";
  const label = status === "Pending" ? "Pending approval" : status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
