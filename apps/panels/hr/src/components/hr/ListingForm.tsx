import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, qk, DOMAINS, type Listing, type ListingKind } from "@/lib/api";
import { forInput } from "@/lib/format";

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship · 1 month",
  "Internship · 2 months",
  "Internship · 3 months",
  "Internship · 6 months",
];

const schema = z.object({
  title: z.string().min(4, "Give the listing a title of at least 4 characters."),
  description: z.string().min(20, "Write at least a couple of sentences so applicants know more."),
  domain: z.string().min(1, "Pick a domain."),
  locationType: z.string().min(2, "Where will this person work?"),
  type: z.string().min(1, "Pick a type."),
  openUntil: z.string().min(1, "Pick the last date people can apply."),
  kind: z.enum(["job", "internship"]),
});

type FormValues = z.infer<typeof schema>;

export function ListingForm({
  listing,
  defaultKind = "job",
}: {
  listing?: Listing;
  defaultKind?: ListingKind;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: listing?.title ?? "",
      description: listing?.description ?? "",
      domain: listing?.domain ?? "",
      locationType: listing?.locationType ?? "",
      type: listing?.type ?? "Full-time",
      openUntil: listing ? forInput(listing.openUntil ?? "") : "",
      kind: (listing?.kind ?? defaultKind) as "job" | "internship",
    },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        openUntil: new Date(values.openUntil).toISOString(),
        status: "open" as const,
      };
      if (listing) {
        return api.updateListing(listing.id, payload);
      }
      return api.createListing(payload);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: qk.listings });
      if (saved?.id) queryClient.invalidateQueries({ queryKey: qk.listing(saved.id) });
      toast.success(listing ? "Listing updated" : "Listing posted — pending admin approval");
      navigate({ to: "/careers/listings" });
    },
    onError: (e: any) => toast.error(e.message || "Couldn't save this listing. Please try again."),
  });

  const errors = form.formState.errors;

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => save.mutate(values))}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="e.g. Frontend Engineer (React)" {...form.register("title")} />
          {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Is this a job or an internship?</Label>
          <Select
            value={form.watch("kind")}
            onValueChange={(v) => form.setValue("kind", v as ListingKind)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="job">Job</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Domain</Label>
          <Select value={form.watch("domain")} onValueChange={(v) => form.setValue("domain", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a domain" />
            </SelectTrigger>
            <SelectContent>
              {DOMAINS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.domain && <p className="text-xs text-danger">{errors.domain.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="locationType">Location / Mode</Label>
          <Input
            id="locationType"
            placeholder="e.g. Remote, Onsite, Hybrid"
            {...form.register("locationType")}
          />
          {errors.locationType && <p className="text-xs text-danger">{errors.locationType.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            value={form.watch("type")}
            onValueChange={(v) => form.setValue("type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick a type" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="openUntil">Last date to apply</Label>
          <Input id="openUntil" type="date" {...form.register("openUntil")} />
          <p className="text-xs text-muted-foreground">
            After this date the listing shows as Expired and nobody can apply.
          </p>
          {errors.openUntil && <p className="text-xs text-danger">{errors.openUntil.message}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={6}
            placeholder="What will this person do day to day? What are you looking for?"
            {...form.register("description")}
          />
          {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={save.isPending}>
          {listing ? "Save listing" : "Post listing"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/careers/listings" })}>
          Cancel
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {listing
          ? "Saved changes go back to Admin for approval before they're live."
          : "Once you post it, an Admin approves it before applicants can see it."}
      </p>
    </form>
  );
}
