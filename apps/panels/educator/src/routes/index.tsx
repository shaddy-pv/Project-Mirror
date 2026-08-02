import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Plus, Users } from "lucide-react";

import { AppShell } from "@/components/educator/AppShell";
import { EmptyState } from "@/components/educator/EmptyState";
import { StatusBadge } from "@/components/educator/StatusBadge";
import { RoleGuard } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { seedProfile } from "@/lib/mock/seed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Educator Dashboard — Enginow" },
      {
        name: "description",
        content:
          "Your Enginow educator dashboard: your courses, enrollment counts, pending approvals and recent learners.",
      },
      { property: "og:title", content: "Educator Dashboard — Enginow" },
      {
        property: "og:description",
        content: "Create courses, track enrolled learners and see what's waiting on Admin approval.",
      },
    ],
  }),
  component: () => (
    <RoleGuard allow={["educator"]}>
      <Dashboard />
    </RoleGuard>
  ),
});

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function Dashboard() {
  const navigate = useNavigate();
  const courses = useQuery({ queryKey: ["courses"], queryFn: () => api.listCourses() });
  const counts = useQuery({ queryKey: ["counts"], queryFn: () => api.enrollmentCounts() });
  const learners = useQuery({ queryKey: ["learners"], queryFn: () => api.listLearners() });

  const mine = courses.data ?? [];
  const pending = mine.filter((c) => c.status === "pending");
  const byId = new Map(mine.map((c) => [c.id, c]));

  return (
    <AppShell
      title={`Welcome back, ${seedProfile.name.split(" ").slice(-1)[0]}`}
      description="Everything you teach on Enginow, in one place."
      help={{
        title: "Your dashboard",
        lines: [
          "These are only your own courses — nobody else's work shows up here.",
          "Anything marked “Pending approval” is with Admin. It goes live as soon as they approve it.",
        ],
      }}
      actions={
        <Button onClick={() => navigate({ to: "/courses/new", search: { kind: "course" } })}>
          <Plus className="mr-1 size-4" /> Create new course
        </Button>
      }
    >
      <div className="space-y-8">
        {pending.length > 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning-soft px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-medium text-warning">
              <Clock className="size-4" />
              {pending.length === 1
                ? "1 submission is waiting on Admin approval"
                : `${pending.length} submissions are waiting on Admin approval`}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-warning">
              {pending.map((c) => (
                <li key={c.id}>
                  <Link to="/courses/$courseId" params={{ courseId: c.id }} className="underline">
                    {c.title}
                  </Link>{" "}
                  — submitted {fmt(c.updatedAt)}, waiting for review
                </li>
              ))}
            </ul>
          </div>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">My courses</h2>
          {courses.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : mine.length === 0 ? (
            <div className="rounded-lg border border-border bg-card">
              <EmptyState
                icon={BookOpen}
                line="No courses yet → Create your first course."
                actionLabel="Create course"
                onAction={() => navigate({ to: "/courses/new", search: { kind: "course" } })}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((c) => (
                <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base leading-snug">{c.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-2">
                      <StatusBadge status={c.status} />
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="size-4" />
                        {counts.data?.[c.id] ?? 0} learners
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent enrollments
          </h2>
          <Card>
            <CardContent className="p-0">
              {(learners.data ?? []).length === 0 ? (
                <EmptyState icon={Users} line="No learners have enrolled yet." />
              ) : (
                <ul className="divide-y divide-border">
                  {(learners.data ?? []).slice(0, 8).map((l) => (
                    <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                      <span className="font-medium">{l.name}</span>
                      <span className="text-muted-foreground">{byId.get(l.courseId)?.title ?? "Course removed"}</span>
                      <span className="text-muted-foreground">{fmt(l.enrolledAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
