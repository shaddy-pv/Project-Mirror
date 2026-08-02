import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Briefcase, Plus } from "lucide-react";
import { useState } from "react";

import { DataTable, type Column } from "@/components/hr/DataTable";
import { EmptyState } from "@/components/hr/EmptyState";
import { PageHeader } from "@/components/hr/PageHeader";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, qk } from "@/lib/api";
import { DOMAINS, type Listing, type ListingKind } from "@/lib/mock/db";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/careers/listings/")({
  head: () => ({
    meta: [
      { title: "Jobs & Internships — Enginow HR" },
      {
        name: "description",
        content:
          "Post, edit and close job and internship listings, and track how many people applied to each one.",
      },
      { property: "og:title", content: "Jobs & Internships — Enginow HR" },
      {
        property: "og:description",
        content: "Post, edit and close listings and track applications.",
      },
    ],
  }),
  component: ListingsPage,
});

function ListingsPage() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<ListingKind>("Job");

  const { data: listings = [], isLoading } = useQuery({
    queryKey: qk.listings,
    queryFn: api.listings,
  });
  const { data: applicants = [] } = useQuery({
    queryKey: qk.applicants(),
    queryFn: () => api.applicants(),
  });

  const rows = listings.filter((l) => l.kind === kind);
  const countFor = (id: string) => applicants.filter((a) => a.listingId === id).length;

  const columns: Column<Listing>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title,
      render: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">
            {r.location} · {r.employmentType}
          </p>
        </div>
      ),
    },
    { key: "domain", header: "Domain", sortValue: (r) => r.domain, render: (r) => r.domain },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "apps",
      header: "Applications",
      sortValue: (r) => countFor(r.id),
      render: (r) => countFor(r.id),
    },
    {
      key: "close",
      header: "Close date",
      sortValue: (r) => r.closeDate,
      render: (r) => formatDate(r.closeDate),
    },
  ];

  return (
    <>
      <PageHeader
        title="Jobs & Internships"
        subtitle="Your postings and their applicants."
        help={[
          "Every job and internship you posted lives here. Click a row to see its applicants and move them through hiring stages.",
          "Listings you just posted show a “Pending approval” badge until an Admin approves them.",
        ]}
        actions={
          <Button onClick={() => navigate({ to: "/careers/listings/new" })}>
            <Plus /> Post new listing
          </Button>
        }
      />

      <div className="space-y-4 px-6 py-6">
        <Tabs value={kind} onValueChange={(v) => setKind(v as ListingKind)}>
          <TabsList>
            <TabsTrigger value="Job">Jobs</TabsTrigger>
            <TabsTrigger value="Internship">Internships</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          searchPlaceholder="Search by title…"
          searchValue={(r) => r.title}
          filters={[
            {
              key: "status",
              label: "Statuses",
              options: ["Pending", "Open", "Closed", "Expired"],
              matches: (r, v) => r.status === v,
            },
            {
              key: "domain",
              label: "Domains",
              options: DOMAINS,
              matches: (r, v) => r.domain === v,
            },
          ]}
          onRowClick={(r) => navigate({ to: "/careers/listings/$id", params: { id: r.id } })}
          emptyState={
            <EmptyState
              icon={Briefcase}
              line={`No ${kind === "Job" ? "jobs" : "internships"} yet → Post your first ${
                kind === "Job" ? "job" : "internship"
              }.`}
              actionLabel="Post new listing"
              onAction={() => navigate({ to: "/careers/listings/new" })}
            />
          }
        />
      </div>
    </>
  );
}
