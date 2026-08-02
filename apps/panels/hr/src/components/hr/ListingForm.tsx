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
import { api, qk } from "@/lib/api";
import { DOMAINS, type Listing, type ListingKind } from "@/lib/mock/db";
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
  location: z.string().min(2, "Where will this person work?"),
  employmentType: z.string().min(1, "Pick a type."),
  closeDate: z.string().min(1, "Pick the last date people can apply."),
  kind: z.enum(["Job", "Internship"]),
});

type FormValues = z.infer<typeof schema>;

export function ListingForm({
  listing,
  defaultKind = "Job",
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
      location: listing?.location ?? "",
      employmentType: listing?.employmentType ?? "Full-time",
      closeDate: listing ? forInput(listing.closeDate) : "",
      kind: listing?.kind ?? defaultKind,
    },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        closeDate: new Date(values.closeDate).toISOString(),
      };
      if (listing) {
        return api.updateListing(listing.id, { ...payload, status: "Pending" });
      }
      return api.createListing(payload);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: qk.listings });
      queryClient.invalidateQueries({ queryKey: qk.listing(saved.id) });
      toast.success(listing ? "Listing sent for approval" : "Listing posted");
      navigate({ to: "/careers/listings/$id", params: { id: saved.id } });
    },
    onError: () => toast.error("Couldn't save this listing. Please try again."),
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
              <SelectItem value="Job">Job</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
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
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. Bengaluru · Hybrid"
            {...form.register("location")}
          />
          {errors.location && <p className="text-xs text-danger">{errors.location.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            value={form.watch("employmentType")}
            onValueChange={(v) => form.setValue("employmentType", v)}
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
          <Label htmlFor="closeDate">Last date to apply</Label>
          <Input id="closeDate" type="date" {...form.register("closeDate")} />
          <p className="text-xs text-muted-foreground">
            After this date the listing shows as Expired and nobody can apply.
          </p>
          {errors.closeDate && <p className="text-xs text-danger">{errors.closeDate.message}</p>}
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
