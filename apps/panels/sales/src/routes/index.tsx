import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, LineChart as LineIcon, Users, X } from "lucide-react";
import { AppShell } from "@/components/sales/AppShell";
import { DateRangeSelector } from "@/components/sales/DateRangeSelector";
import { EmptyState } from "@/components/sales/EmptyState";
import { HelpDrawer } from "@/components/sales/HelpDrawer";
import { KpiCard } from "@/components/sales/KpiCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDashboard, resolveRange } from "@/lib/sales-api";
import { useSalesUi } from "@/store/sales-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sales Dashboard — Enginow" },
      {
        name: "description",
        content:
          "Enrollment numbers, top courses and referral channels for the Enginow sales team, in plain language.",
      },
      { property: "og:title", content: "Sales Dashboard — Enginow" },
      {
        property: "og:description",
        content: "Enrollment numbers, top courses and referral channels for the Enginow sales team.",
      },
    ],
  }),
  component: DashboardPage,
});

const HELP = [
  { title: "Enrollments", body: "How many times someone signed up for a course inside the period you picked. One learner taking two courses counts twice." },
  { title: "Learners", body: "How many different people are behind those enrollments." },
  { title: "Growth", body: "The same length of time just before this one, compared with now. +18% means almost a fifth more sign-ups than last time." },
  { title: "Top courses", body: "The ten courses people signed up for most. Click a bar to look at only that course." },
  { title: "Year and college", body: "Which study year and which colleges the sign-ups came from — useful for deciding where to reach out next." },
  { title: "Referral leaderboard", body: "People whose shared link brought in the most sign-ups. View only — nothing here can be changed." },
];

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 12,
  color: "var(--foreground)",
};

function DashboardPage() {
  const { preset, from, to, course, college, toggleCourse, toggleCollege, clearFilters } = useSalesUi();
  const selection = { preset, from, to };
  const range = resolveRange(selection);

  const { data, isPending } = useQuery({
    queryKey: ["dashboard", preset, from, to, course, college],
    queryFn: () => fetchDashboard(selection, { course, college }),
  });

  return (
    <AppShell
      title="Dashboard"
      subtitle="Enrollment numbers you can take into a call"
      actions={
        <>
          <DateRangeSelector />
          <HelpDrawer
            title="What am I looking at?"
            intro="Plain-language notes on every number on this page."
            items={HELP}
          />
        </>
      }
    >
      {course || college ? (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <span className="text-muted-foreground">Showing only:</span>
          {course ? (
            <Button variant="secondary" size="sm" onClick={() => toggleCourse(course)}>
              {course} <X className="ml-1 size-3.5" />
            </Button>
          ) : null}
          {college ? (
            <Button variant="secondary" size="sm" onClick={() => toggleCollege(college)}>
              {college} <X className="ml-1 size-3.5" />
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Show everything
          </Button>
        </div>
      ) : null}

      {isPending || !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total enrollments"
              value={data.kpis.enrollments.toLocaleString()}
              sub={`In the ${data.rangeLabel}`}
              deltaPct={data.kpis.growthPct}
              deltaLabel={`previous ${range.days} days`}
            />
            <KpiCard
              label="Total learners"
              value={data.kpis.learners.toLocaleString()}
              sub="Different people, not repeat sign-ups"
            />
            <KpiCard
              label="Most-enrolled course"
              value={data.kpis.topCourse?.name ?? "—"}
              sub={data.kpis.topCourse ? `${data.kpis.topCourse.count} sign-ups` : "No sign-ups yet"}
            />
            <KpiCard
              label="Enrollment growth"
              value={data.kpis.growthPct == null ? "—" : `${data.kpis.growthPct > 0 ? "+" : ""}${data.kpis.growthPct}%`}
              sub={`Compared with the ${range.days} days before this`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Top courses by enrollment" description="Click a bar to look at just that course.">
              {data.topCourses.length === 0 ? (
                <EmptyState icon={BarChart3} message="No enrollments in this range yet." hint="Try a longer time period." />
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={data.topCourses} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={175}
                      tick={{ fontSize: 11 }}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
                    <Bar
                      dataKey="count"
                      name="Enrollments"
                      radius={[0, 6, 6, 0]}
                      onClick={(d: { name?: string }) => d?.name && toggleCourse(d.name)}
                      className="cursor-pointer"
                    >
                      {data.topCourses.map((c) => (
                        <Cell
                          key={c.name}
                          fill={course && course !== c.name ? "var(--chart-4)" : "var(--chart-1)"}
                          opacity={course && course !== c.name ? 0.35 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <div className="space-y-4">
              <ChartCard title="Enrollment trend" description={`Sign-ups over the ${data.rangeLabel}.`}>
                {data.trend.length === 0 ? (
                  <EmptyState icon={LineIcon} message="No enrollments in this range yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data.trend} margin={{ left: -18, right: 8 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" minTickGap={24} />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Enrollments"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Enrollments by study year" description="Which year of college learners are in.">
                {data.byYear.length === 0 ? (
                  <EmptyState icon={Users} message="No enrollments in this range yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.byYear} margin={{ left: -18, right: 8 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
                      <Bar dataKey="count" name="Enrollments" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Enrollments by college" description="Click a bar to look at just that college.">
              {data.byCollege.length === 0 ? (
                <EmptyState icon={BarChart3} message="No enrollments in this range yet." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.byCollege} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis type="category" dataKey="label" width={175} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
                    <Bar
                      dataKey="count"
                      name="Enrollments"
                      radius={[0, 6, 6, 0]}
                      onClick={(d: { label?: string }) => d?.label && toggleCollege(d.label)}
                      className="cursor-pointer"
                    >
                      {data.byCollege.map((c) => (
                        <Cell
                          key={c.label}
                          fill={college && college !== c.label ? "var(--chart-4)" : "var(--chart-1)"}
                          opacity={college && college !== c.label ? 0.35 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <Card className="border-border/70 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Referral leaderboard</CardTitle>
                <CardDescription>Top 10 people bringing in sign-ups. View only.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.referrers.length === 0 ? (
                  <EmptyState icon={Users} message="No referrals recorded yet." />
                ) : (
                  <ol className="divide-y divide-border">
                    {data.referrers.map((r, i) => (
                      <li key={r.code} className="flex items-center gap-3 py-2.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                          <p className="text-xs text-muted-foreground">Code {r.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{r.signups}</p>
                          <p className="text-xs text-muted-foreground">sign-ups</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
