import { createFileRoute } from "@tanstack/react-router";

import { ListingForm } from "@/components/hr/ListingForm";
import { PageHeader } from "@/components/hr/PageHeader";

export const Route = createFileRoute("/careers/listings/new")({
  head: () => ({
    meta: [
      { title: "Post a new listing — Enginow HR" },
      {
        name: "description",
        content:
          "Create a job or internship listing: title, description, domain, location, type and last date to apply.",
      },
      { property: "og:title", content: "Post a new listing — Enginow HR" },
      {
        property: "og:description",
        content: "Create a job or internship listing for Admin approval.",
      },
    ],
  }),
  component: NewListingPage,
});

function NewListingPage() {
  return (
    <>
      <PageHeader
        title="Post a new listing"
        subtitle="Fill this in and an Admin will approve it before it goes live."
        help={[
          "Describe the role the way a student would read it — plain language, no internal codes.",
          "The last date to apply matters: after it passes, the listing shows as Expired and nobody can apply.",
        ]}
      />
      <div className="max-w-3xl px-6 py-6">
        <ListingForm />
      </div>
    </>
  );
}
