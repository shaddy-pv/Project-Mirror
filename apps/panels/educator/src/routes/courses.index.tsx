import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Plus } from "lucide-react";
import { z } from "zod";

import { AppShell } from "@/components/educator/AppShell";
import { DataTable, type Column } from "@/components/educator/DataTable";
import { EmptyState } from "@/components/educator/EmptyState";
import { StatusBadge } from "@/components/educator/StatusBadge";
import { RoleGuard } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import type { Course } from "@/lib/mock/types";

const searchSchema = z.object({ tab: z.enum(["courses", "training"]).catch("courses") });

export const Route = createFileRoute("/courses/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Courses & Training — Enginow Educator" },
      {
        name: "description",
        content: "Every course and training program you've built on Enginow, with status and enrollment counts.",
      },
      { property: "og:title", content: "Courses & Training — Enginow Educator" },
      {
        property: "og:description",
        content: "Search, filter and edit your own courses and training programs.",
      },
    ],
  }),
  component: () => (
    <RoleGuard allow={["educator"]}>
      <CoursesPage />
    </RoleGuard>
  ),
});

function CoursesPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const kind: Course["kind"] = tab === "training" ? "training" : "course";
  const noun = kind === "training" ? "training program" : "course";

  const courses = useQuery({ queryKey: ["courses", kind], queryFn: () => api.listCourses(kind) });
  const counts = useQuery({ queryKey: ["counts"], queryFn: () => api.enrollmentCounts() });

  const columns: Array<Column<Course>> = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    { key: "category", header: "Category", render: (r) => r.category },
    {
      key: "type",
      header: "Type",
      render: (r) => <span className="capitalize">{r.pricing}</span>,
    },
    {
      key: "badges",
      header: "Badges",
      render: (r) =>
        r.badges.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="capitalize">{r.badges.join(", ")}</span>
        ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "enrollments",
      header: "Enrollments",
      sortable: true,
      sortValue: (r) => counts.data?.[r.id] ?? 0,
      className: "text-right",
      render: (r) => counts.data?.[r.id] ?? 0,
    },
  ];

  return (
    <AppShell
      title="Courses & Training"
      description="Only your own courses appear here."
      help={{
        title: "Courses & Training",
        lines: [
          "Courses and training programs work the same way — training programs just run as guided cohorts.",
          "Every change you submit goes to Admin for approval before learners see it.",
        ],
      }}
      actions={
        <Button onClick={() => navigate({ to: "/courses/new", search: { kind } })}>
          <Plus className="mr-1 size-4" /> Create {noun}
        </Button>
      }
    >
      <div className="space-y-5">
        <Tabs value={tab} onValueChange={(v) => navigate({ to: "/courses", search: { tab: v as "courses" } })}>
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="training">Training Programs</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable
          rows={courses.data ?? []}
          columns={columns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search by title"
          searchValue={(r) => r.title}
          onRowClick={(r) => navigate({ to: "/courses/$courseId", params: { courseId: r.id } })}
          filters={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "draft", label: "Draft" },
                { value: "pending", label: "Pending approval" },
                { value: "live", label: "Live" },
                { value: "rejected", label: "Rejected" },
                { value: "archived", label: "Archived" },
              ],
              matches: (r, v) => r.status === v,
            },
            {
              id: "category",
              label: "Category",
              options: ["AI", "Development", "Data Science", "Electronics", "Core Engineering"].map((c) => ({
                value: c,
                label: c,
              })),
              matches: (r, v) => r.category === v,
            },
          ]}
          emptyState={
            <EmptyState
              icon={BookOpen}
              line={`No ${noun}s yet → Create your first ${noun}.`}
              actionLabel={`Create ${noun}`}
              onAction={() => navigate({ to: "/courses/new", search: { kind } })}
            />
          }
        />
      </div>
    </AppShell>
  );
}
