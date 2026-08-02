import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Plus } from "lucide-react";
import { useState } from "react";

import { ApplicantDrawer } from "@/components/hr/ApplicantDrawer";
import { EmptyState } from "@/components/hr/EmptyState";
import { PageHeader } from "@/components/hr/PageHeader";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { api, qk } from "@/lib/api";
import { STAGES } from "@/lib/mock/db";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HR Dashboard — Enginow Hiring" },
      {
        name: "description",
        content:
          "Your live listings, pipeline counts and the newest applicants across every job and internship you posted.",
      },
      { property: "og:title", content: "HR Dashboard — Enginow Hiring" },
      {
        property: "og:description",
        content: "Live listings, pipeline counts and newest applicants in one place.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [openApplicant, setOpenApplicant] = useState<string | null>(null);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: qk.listings,
    queryFn: api.listings,
  });
  const { data: applicants = [] } = useQuery({
    queryKey: qk.applicants(),
    queryFn: () => api.applicants(),
  });

  const myListings = listings.filter((l) => l.status !== "Closed");
  const countFor = (id: string) => applicants.filter((a) => a.listingId === id).length;
  const recent = applicants.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Everything you posted, and who applied."
        help={[
          "This is your hiring home. Each card is a listing you posted, with how many people have applied so far.",
          "Use “Post new listing” to add a job or internship. Admin approves it before applicants can see it.",
        ]}
        actions={
          <Button onClick={() => navigate({ to: "/careers/listings/new" })}>
            <Plus /> Post new listing
          </Button>
        }
      />

      <div className="space-y-8 px-6 py-6">
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Where applicants are right now
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {STAGES.map((stage) => (
              <div
                key={stage}
                className="min-w-[130px] rounded-xl border bg-card px-4 py-3 shadow-sm"
              >
                <p className="text-2xl font-semibold">
                  {applicants.filter((a) => a.stage === stage).length}
                </p>
                <p className="text-xs text-muted-foreground">{stage}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              My listings
            </h2>
            <Link to="/careers/listings" className="text-sm text-brand underline underline-offset-4">
              See all listings
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
              ))}
            </div>
          ) : myListings.length === 0 ? (
            <div className="mt-3 rounded-xl border bg-card">
              <EmptyState
                icon={Briefcase}
                line="No listings yet → Post your first job or internship."
                actionLabel="Post new listing"
                onAction={() => navigate({ to: "/careers/listings/new" })}
              />
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {myListings.map((listing) => (
                <Link
                  key={listing.id}
                  to="/careers/listings/$id"
                  params={{ id: listing.id }}
                  className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-brand/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{listing.title}</p>
                    <StatusBadge status={listing.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {listing.kind} · {listing.domain}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">{countFor(listing.id)}</span>{" "}
                    <span className="text-muted-foreground">
                      {countFor(listing.id) === 1 ? "application" : "applications"}
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Newest applicants
          </h2>
          <div className="mt-3 divide-y overflow-hidden rounded-xl border bg-card">
            {recent.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Nobody has applied yet. Applications will show up here as soon as they arrive.
              </p>
            ) : (
              recent.map((applicant) => (
                <div
                  key={applicant.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{applicant.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {listings.find((l) => l.id === applicant.listingId)?.title ?? "Closed listing"}{" "}
                      · applied {formatDate(applicant.appliedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={applicant.stage} />
                    <Button variant="outline" size="sm" onClick={() => setOpenApplicant(applicant.id)}>
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <ApplicantDrawer applicantId={openApplicant} onClose={() => setOpenApplicant(null)} />
    </>
  );
}
