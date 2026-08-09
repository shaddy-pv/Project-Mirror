import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Plus, Users, UserCheck, PlayCircle, Activity } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/educator/AppShell";
import { EmptyState } from "@/components/educator/EmptyState";
import { StatusBadge } from "@/components/educator/StatusBadge";
import { RoleGuard } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Educator Dashboard — Enginow" },
      {
        name: "description",
        content:
          "Your Enginow educator dashboard: your courses, enrollment counts, pending approvals and recent learners.",
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
  const dashboard = useQuery({ queryKey: ["educator-dashboard"], queryFn: () => api.getDashboard() });
  const courses = useQuery({ queryKey: ["courses"], queryFn: () => api.listCourses() });

  const mine = courses.data ?? [];
  const pending = mine.filter((c: any) => c.status === "pending" || c.status === "pending_approval");
  const data = dashboard.data;

  return (
    <AppShell
      title={`Welcome back, Educator`}
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
          </div>
        )}

        <section>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
                <BookOpen className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data ? data.kpis.totalCourses : <Skeleton className="h-8 w-12" />}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Live Courses</CardTitle>
                <PlayCircle className="size-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data ? data.kpis.liveCourses : <Skeleton className="h-8 w-12" />}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <Clock className="size-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data ? data.kpis.pendingCourses : <Skeleton className="h-8 w-12" />}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
                <Activity className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data ? data.kpis.totalEnrollments : <Skeleton className="h-8 w-12" />}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unique Learners</CardTitle>
                <UserCheck className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data ? data.kpis.uniqueLearners : <Skeleton className="h-8 w-12" />}</div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Enrollment Trend (Last 30 Days)
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  {!data ? (
                    <Skeleton className="h-full w-full" />
                  ) : data.enrollmentActivity.length === 0 ? (
                    <EmptyState icon={Activity} line="No enrollment data available." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.enrollmentActivity} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                          labelFormatter={(l) => new Date(l).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Enrollments
            </h2>
            <Card className="h-[348px] overflow-hidden">
              <CardContent className="p-0 h-full overflow-y-auto">
                {!data ? (
                  <div className="p-4 space-y-4">
                    {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : data.recentLearners.length === 0 ? (
                  <EmptyState icon={Users} line="No learners have enrolled yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.recentLearners.map((l: any) => (
                      <li key={l.id} className="flex flex-col gap-1 px-4 py-3 text-sm transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{l.name}</span>
                          <span className="text-muted-foreground text-xs">{fmt(l.enrolledAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="truncate max-w-[150px]">{l.courseTitle}</span>
                          <span className="px-2 py-0.5 rounded-full bg-secondary">{l.academicYear}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">My Courses</h2>
            <Link to="/courses" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          {courses.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {mine.slice(0, 4).map((c: any) => (
                <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }}>
                  <Card className="h-full transition-shadow hover:shadow-md hover:border-primary/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base leading-snug line-clamp-1" title={c.title}>{c.title}</CardTitle>
                      <CardDescription>{c.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-2">
                      <StatusBadge status={c.status} />
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="size-4" />
                        {c.enrollments ?? 0}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
