import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/panel/EmptyState";
import { PageHeader } from "@/components/panel/PageHeader";
import { RoleGuard } from "@/components/panel/RoleGuard";
import { ApprovalBar } from "@/components/panel/ApprovalBar";
import {
  listApprovals, setBlogStatus, setCourseStatus,
  setInternshipStatus, setCareerStatus, type ApprovalItem
} from "@/mocks/api";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals Inbox — Enginow Panel" },
      {
        name: "description",
        content: "One queue for every course and article waiting to go live on Enginow.",
      },
      { property: "og:title", content: "Approvals Inbox — Enginow Panel" },
      {
        property: "og:description",
        content: "One queue for every course and article waiting to go live on Enginow.",
      },
    ],
  }),
  component: () => (
    <RoleGuard module="approvals">
      <ApprovalsPage />
    </RoleGuard>
  ),
});

function ApprovalsPage() {
  const qc = useQueryClient();
  const { data: items = [], isPending } = useQuery({
    queryKey: ["approvals"],
    queryFn: listApprovals,
  });

  const decide = useMutation({
    mutationFn: ({
      item,
      approve,
      reason,
    }: {
      item: ApprovalItem;
      approve: boolean;
      reason?: string;
    }): Promise<unknown> => {
      const status = approve ? "live" : "rejected";
      if (item.type === "Course" || item.type === "Training") return setCourseStatus(item.id, status, reason);
      if (item.type === "Internship") return setInternshipStatus(item.id, approve ? "open" : "rejected", reason);
      if (item.type === "Career") return setCareerStatus(item.id, approve ? "open" : "rejected", reason);
      return setBlogStatus(item.id, status, reason);
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["blogs"] });
      qc.invalidateQueries({ queryKey: ["internships"] });
      qc.invalidateQueries({ queryKey: ["careers"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(
        vars.approve
          ? `"${vars.item.title}" approved and published`
          : `"${vars.item.title}" sent back to ${vars.item.submittedBy}`,
      );
    },
  });

  return (
    <div>
      <PageHeader
        title="Approvals Inbox"
        subtitle="Everything the team has sent in, waiting on your yes or no — in one place."
        helpTitle="Approvals Inbox"
        helpLines={[
          "This is the one page to check each morning. Courses and articles from every team land here together.",
          "Approve puts the item live on the website straight away. Send back returns it to the author with your note — nothing is lost.",
          "When this page is empty, there is nothing waiting anywhere in the panel.",
        ]}
      />

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading what's waiting…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <EmptyState
            icon={Inbox}
            message="Nothing is waiting for approval — you're all caught up."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={`${item.type}-${item.id}`}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-6">
                <div className="min-w-64 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="secondary" className="border-0 bg-neutral-soft">
                      {item.type}
                    </Badge>
                    <p className="font-medium">{item.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.preview}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sent in by {item.submittedBy} on {item.submittedOn}
                  </p>
                </div>
                <ApprovalBar
                  itemName={item.title}
                  size="sm"
                  onApprove={() => decide.mutate({ item, approve: true })}
                  onReject={(reason) => decide.mutate({ item, approve: false, reason })}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
