import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AppShell } from "@/components/educator/AppShell";
import { CourseForm } from "@/components/educator/CourseForm";
import { RoleGuard } from "@/lib/role";

const searchSchema = z.object({ kind: z.enum(["course", "training"]).catch("course") });

export const Route = createFileRoute("/courses/new")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Create a course — Enginow Educator" },
      {
        name: "description",
        content: "Add a title, roadmap, videos and banner, then submit your new course to Admin for approval.",
      },
      { property: "og:title", content: "Create a course — Enginow Educator" },
      { property: "og:description", content: "Build a new Enginow course or training program step by step." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["educator"]}>
      <NewCoursePage />
    </RoleGuard>
  ),
});

function NewCoursePage() {
  const { kind } = Route.useSearch();
  const noun = kind === "training" ? "training program" : "course";
  return (
    <AppShell
      title={`Create ${noun}`}
      description={`Fill this in, then submit it to Admin for approval.`}
      help={{
        title: `Creating a ${noun}`,
        lines: [
          "Save a draft any time — drafts stay private to you.",
          "Banners must be 1920×1080. Anything else gets rejected with a note telling you why.",
        ],
      }}
    >
      <CourseForm kind={kind} />
    </AppShell>
  );
}
