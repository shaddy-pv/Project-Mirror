import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ApplicantDrawer } from "@/components/hr/ApplicantDrawer";
import { ConfirmDialog } from "@/components/hr/ConfirmDialog";
import { DataTable, type Column } from "@/components/hr/DataTable";
import { EmptyState } from "@/components/hr/EmptyState";
import { ListingForm } from "@/components/hr/ListingForm";
import { PageHeader } from "@/components/hr/PageHeader";
import { PendingApprovalBanner } from "@/components/hr/PendingApprovalBanner";
import { StageDropdown } from "@/components/hr/StageDropdown";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, qk, type Applicant } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/careers/listings/$id")({
  head: () => ({
    meta: [
      { title: "Listing & applicants — Enginow HR" },
      {
        name: "description",
        content:
          "Edit a listing, close it early, and move its applicants from Applied to Shortlisted, OA and Selected.",
      },
      { property: "og:title", content: "Listing & applicants — Enginow HR" },
      {
        property: "og:description",
        content: "Edit a listing and move its applicants through hiring stages.",
      },
    ],
  }),
  component: ListingDetailPage,
});

function ListingDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openApplicant, setOpenApplicant] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: qk.listing(id),
    queryFn: () => api.listing(id),
  });
  const { data: applicants = [], isLoading: loadingApplicants } = useQuery({
    queryKey: qk.applicants({ listingId: id }),
    queryFn: () => api.applicants({ listingId: id }),
  });

  const setStatus = useMutation({
    mutationFn: (open: boolean) => (open ? api.reopenListing(id, listing?.kind) : api.closeListing(id, listing?.kind)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.listing(id) });
      queryClient.invalidateQueries({ queryKey: qk.listings });
      setConfirmClose(false);
      toast.success("Listing updated");
    },
    onError: () => toast.error("Couldn't change this listing. Please try again."),
  });

  const remove = useMutation({
    mutationFn: () => api.removeListing(id, listing?.kind),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.listings });
      setConfirmRemove(false);
      toast.success("Listing removed");
      navigate({ to: "/careers/listings" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const columns: Column<Applicant>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    { key: "email", header: "Email", render: (r) => r.email },
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
          <StageDropdown applicantId={r.id} stage={r.stage} kind={r.kind} />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="px-6 py-10 text-sm text-muted-foreground">Loading listing…</div>;
  }

  if (!listing) {
    return (
      <div className="px-6 py-10">
        <p className="text-sm text-muted-foreground">
          This listing no longer exists. It may have been removed.
        </p>
        <Link to="/careers/listings" className="mt-3 inline-block text-sm text-brand underline">
          Back to Jobs & Internships
        </Link>
      </div>
    );
  }

  const canApply = listing.isOpen;

  return (
    <>
      <PageHeader
        title={listing.title}
        subtitle={`${listing.kind} · ${listing.domain} · closes ${formatDate(listing.openUntil ?? "")}`}
        help={[
          "The Applicants tab lists everyone who applied. Use the stage dropdown on each row to move them along.",
          "Closing a listing stops new applications but keeps every applicant you already have.",
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/careers/listings" })}>
            <ArrowLeft /> All listings
          </Button>
        }
      />

      <div className="space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card px-4 py-3">
          <StatusBadge status={listing.status} />
          <span className="text-sm text-muted-foreground">
            {applicants.length} {applicants.length === 1 ? "person" : "people"} applied
          </span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="applications-open"
                checked={canApply}
                disabled={listing.status === "pending_approval" || listing.status === "expired"}
                onCheckedChange={(checked) => {
                  if (checked) setStatus.mutate(true);
                  else setConfirmClose(true);
                }}
              />
              <Label htmlFor="applications-open" className="text-sm">
                Accepting applications
              </Label>
            </div>
            <Button variant="outline" size="sm" onClick={() => setConfirmRemove(true)}>
              <Trash2 /> Remove listing
            </Button>
          </div>
        </div>

        {(listing.status === "pending_approval") && <PendingApprovalBanner what="listing" />}
        {listing.status === "expired" && (
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-foreground/80">
            The last date to apply has passed, so this listing is Expired. Edit the date and save to
            accept applications again.
          </div>
        )}

        <Tabs defaultValue="applicants">
          <TabsList>
            <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
            <TabsTrigger value="details">Listing details</TabsTrigger>
          </TabsList>

          <TabsContent value="applicants" className="mt-4">
            <DataTable
              rows={applicants}
              columns={columns}
              rowKey={(r) => r.id}
              isLoading={loadingApplicants}
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
                  line="Nobody has applied to this listing yet → share it once Admin approves it and applications will land here."
                />
              }
            />
          </TabsContent>

          <TabsContent value="details" className="mt-4 max-w-3xl">
            <ListingForm listing={listing} />
          </TabsContent>
        </Tabs>
      </div>

      <ApplicantDrawer applicantId={openApplicant} onClose={() => setOpenApplicant(null)} />

      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title="Close this listing?"
        consequence={`Closing this listing means no one can apply anymore. ${applicants.length} ${
          applicants.length === 1 ? "person has" : "people have"
        } already applied — you'll still see them and can keep moving them through stages.`}
        confirmLabel="Close listing"
        cancelLabel="Keep it open"
        destructive
        isPending={setStatus.isPending}
        onConfirm={() => setStatus.mutate(false)}
      />

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remove this listing?"
        consequence={
          applicants.length > 0
            ? `${applicants.length} ${
                applicants.length === 1 ? "applicant is" : "applicants are"
              } attached to this listing, so it can't be removed — their history would be lost. Close the listing instead: it stays here as Closed and you keep every applicant.`
            : "Removing takes this listing off your list for good. Nobody has applied, so no applicant history is lost."
        }
        confirmLabel={applicants.length > 0 ? "Close listing instead" : "Remove listing"}
        cancelLabel="Keep listing"
        destructive
        {...(applicants.length === 0 ? { typedConfirmation: "REMOVE" } : {})}
        isPending={remove.isPending || setStatus.isPending}
        onConfirm={() => {
          if (applicants.length > 0) {
            setConfirmRemove(false);
            setStatus.mutate(false);
          } else {
            remove.mutate();
          }
        }}
      />
    </>
  );
}
