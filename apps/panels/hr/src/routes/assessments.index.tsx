import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClipboardList, Plus } from "lucide-react";

import { DataTable, type Column } from "@/components/hr/DataTable";
import { EmptyState } from "@/components/hr/EmptyState";
import { PageHeader } from "@/components/hr/PageHeader";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { api, qk } from "@/lib/api";
import type { Assessment } from "@/lib/mock/db";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/assessments/")({
  head: () => ({
    meta: [
      { title: "Hiring Assessments — Enginow HR" },
      {
        name: "description",
        content:
          "Create hiring assessments for shortlisted candidates, set time limits and review scores and integrity flags.",
      },
      { property: "og:title", content: "Hiring Assessments — Enginow HR" },
      {
        property: "og:description",
        content: "Create assessments for shortlisted candidates and review results.",
      },
    ],
  }),
  component: AssessmentsPage,
});

function AssessmentsPage() {
  const navigate = useNavigate();
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: qk.assessments,
    queryFn: api.assessments,
  });
  const { data: listings = [] } = useQuery({ queryKey: qk.listings, queryFn: api.listings });

  const columns: Column<Assessment>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title,
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "listing",
      header: "Linked listing",
      render: (r) => listings.find((l) => l.id === r.listingId)?.title ?? "—",
    },
    {
      key: "duration",
      header: "Duration",
      sortValue: (r) => r.durationMins,
      render: (r) => `${r.durationMins} min`,
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "created",
      header: "Created",
      sortValue: (r) => r.createdAt,
      render: (r) => formatDate(r.createdAt),
    },
  ];

  return (
    <>
      <PageHeader
        title="Assessments"
        subtitle="Tests you send to shortlisted candidates."
        help={[
          "An assessment is a timed test linked to one listing. Only people you've Shortlisted for that listing can take it.",
          "Open an assessment to edit questions or see who scored what.",
        ]}
        actions={
          <Button onClick={() => navigate({ to: "/assessments/new" })}>
            <Plus /> Create assessment
          </Button>
        }
      />
      <div className="px-6 py-6">
        <DataTable
          rows={assessments}
          columns={columns}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          searchPlaceholder="Search by title…"
          searchValue={(r) => r.title}
          filters={[
            {
              key: "status",
              label: "Statuses",
              options: ["Draft", "Live", "Closed"],
              matches: (r, v) => r.status === v,
            },
          ]}
          onRowClick={(r) => navigate({ to: "/assessments/$id", params: { id: r.id } })}
          emptyState={
            <EmptyState
              icon={ClipboardList}
              line="No assessments yet → create your first test for shortlisted candidates."
              actionLabel="Create assessment"
              onAction={() => navigate({ to: "/assessments/new" })}
            />
          }
        />
      </div>
    </>
  );
}
