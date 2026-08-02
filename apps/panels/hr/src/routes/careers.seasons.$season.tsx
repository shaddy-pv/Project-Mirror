import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Users } from "lucide-react";
import { useState } from "react";

import { ApplicantDrawer } from "@/components/hr/ApplicantDrawer";
import { DataTable, type Column } from "@/components/hr/DataTable";
import { EmptyState } from "@/components/hr/EmptyState";
import { PageHeader } from "@/components/hr/PageHeader";
import { StageDropdown } from "@/components/hr/StageDropdown";
import { Button } from "@/components/ui/button";
import { api, qk } from "@/lib/api";
import type { Applicant, SeasonName } from "@/lib/mock/db";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/careers/seasons/$season")({
  head: () => ({
    meta: [
      { title: "Season applicants — Enginow HR" },
      {
        name: "description",
        content:
          "Everyone who applied in this internship season, with the same stage control used on job listings.",
      },
      { property: "og:title", content: "Season applicants — Enginow HR" },
      {
        property: "og:description",
        content: "Everyone who applied in this internship season.",
      },
    ],
  }),
  component: SeasonApplicantsPage,
});

function SeasonApplicantsPage() {
  const { season } = Route.useParams();
  const navigate = useNavigate();
  const [openApplicant, setOpenApplicant] = useState<string | null>(null);

  const { data: applicants = [], isLoading } = useQuery({
    queryKey: qk.applicants({ season: season as SeasonName }),
    queryFn: () => api.applicants({ season: season as SeasonName }),
  });
  const { data: listings = [] } = useQuery({ queryKey: qk.listings, queryFn: api.listings });

  const columns: Column<Applicant>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    { key: "email", header: "Email", render: (r) => r.email },
    {
      key: "listing",
      header: "Applied for",
      render: (r) => listings.find((l) => l.id === r.listingId)?.title ?? "Closed listing",
    },
    {
      key: "applied",
      header: "Applied",
      sortValue: (r) => r.appliedAt,
      render: (r) => formatDate(r.appliedAt),
    },
    {
      key: "stage",
      header: "Stage",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <StageDropdown applicantId={r.id} stage={r.stage} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={`${season} season applicants`}
        subtitle="Same stage control as job listings: Applied → Shortlisted → OA → Selected."
        help={[
          "These are internship applicants for this season across every internship listing.",
          "Change someone's stage from the dropdown on their row, or click the row for their full application.",
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/careers/seasons" })}>
            <ArrowLeft /> All seasons
          </Button>
        }
      />

      <div className="px-6 py-6">
        <DataTable
          rows={applicants}
          columns={columns}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          searchPlaceholder="Search applicants by name or email…"
          searchValue={(r) => `${r.name} ${r.email}`}
          filters={[
            {
              key: "stage",
              label: "Stages",
              options: ["Applied", "Shortlisted", "OA", "Selected"],
              matches: (r, v) => r.stage === v,
            },
          ]}
          onRowClick={(r) => setOpenApplicant(r.id)}
          emptyState={
            <EmptyState
              icon={Users}
              line={`No one has applied for the ${season} season yet → open applications on the season card and share your internship listings.`}
            />
          }
        />
      </div>

      <ApplicantDrawer applicantId={openApplicant} onClose={() => setOpenApplicant(null)} />
    </>
  );
}
