import { createFileRoute } from "@tanstack/react-router";

import { AssessmentForm } from "@/components/hr/AssessmentForm";
import { PageHeader } from "@/components/hr/PageHeader";

export const Route = createFileRoute("/assessments/new")({
  head: () => ({
    meta: [
      { title: "Create an assessment — Enginow HR" },
      {
        name: "description",
        content:
          "Set up a timed hiring assessment: title, subject, time limit, questions and eligible shortlisted candidates.",
      },
      { property: "og:title", content: "Create an assessment — Enginow HR" },
      { property: "og:description", content: "Set up a timed hiring assessment." },
    ],
  }),
  component: NewAssessmentPage,
});

function NewAssessmentPage() {
  return (
    <>
      <PageHeader
        title="Create assessment"
        subtitle="Link it to a listing so the right candidates get it."
        help={[
          "Pick the listing first — the eligible candidate list fills in from everyone you've Shortlisted for it.",
          "Keep it in Draft until the questions are final, then set it Live.",
        ]}
      />
      <div className="max-w-3xl px-6 py-6">
        <AssessmentForm />
      </div>
    </>
  );
}
