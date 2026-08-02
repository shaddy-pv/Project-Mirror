import { Clock } from "lucide-react";

export function PendingApprovalBanner({ what = "course" }: { what?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3">
      <Clock className="mt-0.5 size-4 shrink-0 text-warning" />
      <p className="text-sm text-warning">
        This {what} is waiting for Admin approval before it goes live. Learners can't see it yet — we'll email you the
        moment it's reviewed.
      </p>
    </div>
  );
}

export function RejectedBanner({ reason, what = "course" }: { reason: string; what?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-danger-soft px-4 py-3">
      <div className="text-sm text-destructive">
        <p className="font-medium">Admin sent this {what} back for changes</p>
        <p className="mt-1">{reason}</p>
      </div>
    </div>
  );
}
