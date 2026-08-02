import { Clock } from "lucide-react";

export function PendingApprovalBanner({
  what,
  reason,
}: {
  /** e.g. "listing" or "blog post" */
  what: string;
  reason?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-pending/30 bg-pending-soft px-4 py-3">
      <Clock className="mt-0.5 size-4 shrink-0 text-pending" />
      <div className="text-sm">
        <p className="font-medium text-pending">
          This {what} is waiting for Admin approval before it goes live.
        </p>
        <p className="mt-1 text-foreground/70">
          You'll keep seeing it here with a "Pending approval" badge. Nobody outside Enginow can see
          it yet.
        </p>
        {reason && <p className="mt-1 text-foreground/70">{reason}</p>}
      </div>
    </div>
  );
}

export function RejectedBanner({ what, reason }: { what: string; reason: string }) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm">
      <p className="font-medium text-danger">Admin sent this {what} back for changes</p>
      <p className="mt-1 text-foreground/80">{reason}</p>
    </div>
  );
}
