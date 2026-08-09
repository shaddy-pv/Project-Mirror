import { cn } from "@/lib/utils";

type Tone = "gray" | "amber" | "green" | "red";

const TONES: Record<string, Tone> = {
  draft: "gray",
  pending: "amber",
  pending_approval: "amber",
  open: "green",
  live: "green",
  published: "green",
  selected: "green",
  responded: "green",
  shortlisted: "amber",
  oa: "amber",
  applied: "gray",
  new: "amber",
  closed: "red",
  expired: "red",
  rejected: "red",
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
  const normStatus = (status || "").toLowerCase();
  const tone = TONES[normStatus] ?? "gray";
  
  let label = status || "";
  if (normStatus === "pending_approval") label = "Pending approval";
  else if (normStatus) label = normStatus.charAt(0).toUpperCase() + normStatus.slice(1);

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
