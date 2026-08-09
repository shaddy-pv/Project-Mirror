import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/hr/ConfirmDialog";
import { PageHeader } from "@/components/hr/PageHeader";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api, qk, DOMAINS, type Season, type SeasonName } from "@/lib/api";

export const Route = createFileRoute("/careers/seasons/")({
  head: () => ({
    meta: [
      { title: "Internship Seasons — Enginow HR" },
      {
        name: "description",
        content:
          "Open or close applications for the Summer, Monsoon, Spring and Winter internship seasons and pick which domains are hiring.",
      },
      { property: "og:title", content: "Internship Seasons — Enginow HR" },
      {
        property: "og:description",
        content: "Open or close season applications and choose which domains are hiring.",
      },
    ],
  }),
  component: SeasonsPage,
});

function SeasonsPage() {
  const { data: seasons = [], isLoading } = useQuery({ queryKey: qk.seasons, queryFn: api.seasons });

  return (
    <>
      <PageHeader
        title="Internship Seasons"
        subtitle="Four fixed seasons. You control when applications are open and which domains are hiring."
        help={[
          "Each season runs at a fixed time of year. Turn applications on when you're ready to receive them.",
          "Duration options and the public showcase page are managed by Admin — you can see them here for context.",
        ]}
      />

      <div className="grid gap-4 px-6 py-6 xl:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl border bg-card" />
            ))
          : seasons.map((season) => (
              <SeasonCard
                key={season.name}
                season={season}
                applicantCount={0}
              />
            ))}
      </div>
    </>
  );
}

function SeasonCard({ season, applicantCount }: { season: Season; applicantCount: number }) {
  const queryClient = useQueryClient();
  const [confirmClose, setConfirmClose] = useState(false);
  const [domainToAdd, setDomainToAdd] = useState("");

  const update = useMutation({
    mutationFn: (patch: Partial<Season>) => api.updateSeason(season.id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.seasons }),
    onError: () => toast.error("Couldn't save that change. Please try again."),
  });

  const available = DOMAINS.filter((d) => !season.domains.includes(d));

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{season.name} season</h2>
          <p className="text-xs text-muted-foreground">{season.startsText}</p>
        </div>
        <StatusBadge status={season.applicationsOpen ? "Open" : "Closed"} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Switch
          id={`open-${season.name}`}
          checked={season.applicationsOpen}
          onCheckedChange={(checked) => {
            if (checked) {
              update.mutate({ applicationsOpen: true });
              toast.success(`${season.name} applications opened`);
            } else {
              setConfirmClose(true);
            }
          }}
        />
        <Label htmlFor={`open-${season.name}`} className="text-sm">
          Applications open
        </Label>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">Domains open this season</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {season.domains.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No domains added yet → add one below so applicants know what to apply for.
            </p>
          )}
          {season.domains.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1.5 rounded-full border bg-brand-soft px-2.5 py-1 text-xs text-brand"
            >
              {domain}
              <button
                type="button"
                aria-label={`Remove ${domain} from ${season.name}`}
                className="cursor-pointer"
                onClick={() => {
                  update.mutate({ domains: season.domains.filter((d) => d !== domain) });
                  toast.success(`${domain} removed from ${season.name}`);
                }}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>

        {available.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Select value={domainToAdd} onValueChange={setDomainToAdd}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Pick a domain to add" />
              </SelectTrigger>
              <SelectContent>
                {available.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              disabled={!domainToAdd}
              onClick={() => {
                update.mutate({ domains: [...season.domains, domainToAdd] });
                toast.success(`${domainToAdd} added to ${season.name}`);
                setDomainToAdd("");
              }}
            >
              <Plus /> Add domain
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <p className="font-medium text-foreground/70">Starts</p>
          <p>{season.startsText}</p>
        </div>
        <div>
          <p className="font-medium text-foreground/70">Domains</p>
          <p>{season.domains.join(" · ") || "None set"}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {applicantCount} {applicantCount === 1 ? "applicant" : "applicants"} this season
        </p>
        <Link
          to="/careers/seasons/$season"
          params={{ season: season.name }}
          className="text-sm text-brand underline underline-offset-4"
        >
          View {season.name} applicants
        </Link>
      </div>

      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title={`Close ${season.name} applications?`}
        consequence={`Closing means no one can apply to the ${season.name} season anymore. ${applicantCount} ${
          applicantCount === 1 ? "person has" : "people have"
        } already applied — you'll still see them and can keep moving them through stages.`}
        confirmLabel="Close applications"
        cancelLabel="Keep them open"
        destructive
        isPending={update.isPending}
        onConfirm={() => {
          update.mutate({ applicationsOpen: false });
          setConfirmClose(false);
          toast.success(`${season.name} applications closed`);
        }}
      />
    </div>
  );
}
