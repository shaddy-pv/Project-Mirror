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
  const kind = tab === "training" ? "training" : "course";
  const courses = useQuery({ queryKey: ["courses"], queryFn: () => api.listCourses() });
  const rows = (courses.data ?? []).filter((c: any) => c.kind === kind);

  const courseColumns: Array<Column<Course>> = [
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
      render: (r: any) => <span className="capitalize">{r.isPremium ? "Premium" : "Free"}</span>,
    },
    {
      key: "badges",
      header: "Badges",
      render: (r: any) => {
        const b = [];
        if (r.isNew) b.push("New");
        if (r.isPopular) b.push("Popular");
        return b.length === 0 ? <span className="text-muted-foreground">—</span> : <span className="capitalize">{b.join(", ")}</span>;
      }
    },
    { key: "status", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    {
      key: "enrollments",
      header: "Enrollments",
      sortable: true,
      sortValue: (r: any) => r.enrollments ?? 0,
      className: "text-right",
      render: (r: any) => r.enrollments ?? 0,
    },
  ];

  const trainingColumns: Array<Column<Course>> = [
    {
      key: "title",
      header: "Program Name",
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={r.description}>{r.description}</p>
        </div>
      ),
    },
    { key: "duration", header: "Duration", render: (r) => r.duration || "N/A" },
    { key: "status", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    {
      key: "created",
      header: "Created",
      render: (r) => {
        if (!r.createdAt) return "N/A";
        return new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
      },
    },
    {
      key: "enrollments",
      header: "Registrations",
      sortable: true,
      sortValue: (r: any) => r.enrollments ?? 0,
      className: "text-right",
      render: (r: any) => r.enrollments ?? 0,
    },
  ];

  return (
    <AppShell
      title="Courses & Training"
      description="Only your own courses appear here."
      help={{
        title: "Courses",
        lines: [
          "Every change you submit goes to Admin for approval before learners see it.",
        ],
      }}
      actions={
        kind === "course" && (
          <Button onClick={() => navigate({ to: "/courses/new", search: { kind: "course" } })}>
            <Plus className="mr-1 size-4" /> Create course
          </Button>
        )
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
          rows={rows}
          columns={kind === "course" ? courseColumns : trainingColumns}
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
              line={kind === "course" ? `No courses yet → Create your first course.` : `No training programs found.`}
              actionLabel={kind === "course" ? `Create course` : undefined}
              onAction={kind === "course" ? () => navigate({ to: "/courses/new", search: { kind: "course" } }) : undefined}
            />
          }
        />
      </div>
    </AppShell>
  );
}
