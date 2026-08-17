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
  PieChart,
  Pie,
  LabelList,
  Label
} from "recharts";
import { BarChart3, LineChart as LineIcon, Users, X, Lightbulb, PieChart as PieIcon, Link as LinkIcon, BookOpen, GraduationCap } from "lucide-react";
import { AppShell } from "@/components/sales/AppShell";
import { DateRangeSelector } from "@/components/sales/DateRangeSelector";
import { EmptyState } from "@/components/sales/EmptyState";
import { HelpDrawer } from "@/components/sales/HelpDrawer";
import { KpiCard } from "@/components/sales/KpiCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchDashboard, resolveRange } from "@/lib/sales-api";
import { useSalesUi } from "@/store/sales-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sales Dashboard — Enginow" },
      {
        name: "description",
        content: "Enrollment numbers, top courses and referral channels for the Enginow sales team, in plain language.",
      },
    ],
  }),
  component: DashboardPage,
});

const HELP = [
  { title: "Total Enrollments", body: "How many times someone signed up for a course inside the period you picked. One learner taking two courses counts twice." },
  { title: "Active Learners", body: "How many different people are behind those enrollments." },
  { title: "Premium Enrollments", body: "Enrollments in paid/premium courses." },
  { title: "Conversion Rate", body: "Percentage of sales inquiries that resulted in a successful conversion." },
  { title: "Enrollment Growth", body: "Comparison of enrollments in this period vs the preceding period of the exact same length." },
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
    <Card className="border-border/70 shadow-none flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">{children}</CardContent>
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

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)"];

function DashboardPage() {
  const { preset, from, to, course, year, category, type, toggleCourse, toggleYear, toggleCategory, toggleType, clearFilters } = useSalesUi();
  const selection = { preset, from, to };
  const range = resolveRange(selection);

  const { data, isPending } = useQuery({
    queryKey: ["dashboard", preset, from, to, course, year, category, type],
    queryFn: () => fetchDashboard(selection, { course, year, category, type }),
  });

  return (
    <AppShell
      title="Sales Intelligence"
      subtitle="Actionable insights on enrollments, courses, and lead conversion"
      actions={
        <>
          <DateRangeSelector />
          <HelpDrawer
            title="Understanding these metrics"
            intro="Plain-language notes on every number on this page."
            items={HELP}
          />
        </>
      }
    >
      {course || year || category || type ? (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <span className="text-muted-foreground">Showing only:</span>
          {course ? (
            <Button variant="secondary" size="sm" onClick={() => toggleCourse(course)}>
              {course} <X className="ml-1 size-3.5" />
            </Button>
          ) : null}
          {year ? (
            <Button variant="secondary" size="sm" onClick={() => toggleYear(year)}>
              {year} <X className="ml-1 size-3.5" />
            </Button>
          ) : null}
          {category ? (
            <Button variant="secondary" size="sm" onClick={() => toggleCategory(category)}>
              {category} <X className="ml-1 size-3.5" />
            </Button>
          ) : null}
          {type ? (
            <Button variant="secondary" size="sm" onClick={() => toggleType(type)}>
              {type} <X className="ml-1 size-3.5" />
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Show everything
          </Button>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select value={type || "all"} onValueChange={(v) => toggleType(v === "all" ? type || "" : v)}>
          <SelectTrigger className="w-[140px] bg-card h-9">
            <SelectValue placeholder="Course Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category || "all"} onValueChange={(v) => toggleCategory(v === "all" ? category || "" : v)}>
          <SelectTrigger className="w-[150px] bg-card h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Development">Development</SelectItem>
            <SelectItem value="AI">AI</SelectItem>
            <SelectItem value="Data Science">Data Science</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
            <SelectItem value="Cloud">Cloud</SelectItem>
          </SelectContent>
        </Select>

        <Select value={year || "all"} onValueChange={(v) => toggleYear(v === "all" ? year || "" : v)}>
          <SelectTrigger className="w-[150px] bg-card h-9">
            <SelectValue placeholder="Student Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="1st Year">1st Year</SelectItem>
            <SelectItem value="2nd Year">2nd Year</SelectItem>
            <SelectItem value="3rd Year">3rd Year</SelectItem>
            <SelectItem value="4th Year">4th Year</SelectItem>
            <SelectItem value="Graduated">Graduated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending || !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* KPI ROW */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              label="Total enrollments"
              value={data.kpis.totalEnrollments.toLocaleString()}
              sub={`In the ${data.rangeLabel}`}
              deltaPct={data.kpis.enrollmentGrowth}
              deltaLabel={`previous ${range.days} days`}
            />
            <KpiCard
              label="Active learners"
              value={data.kpis.activeLearners.toLocaleString()}
              sub="Unique student accounts"
            />
            <KpiCard
              label="Premium enrollments"
              value={data.kpis.premiumEnrollments.toLocaleString()}
              sub="Paid course sign-ups"
            />
            <KpiCard
              label="Total leads"
              value={data.kpis.totalLeads.toLocaleString()}
              sub="Sales inquiries generated"
            />
            <KpiCard
              label="Conversion rate"
              value={`${data.kpis.conversionRate}%`}
              sub="Leads marked as 'Converted'"
            />
          </div>

          {/* INSIGHTS ROW */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/70 bg-primary/5 shadow-none">
              <CardContent className="pt-6 pb-6 flex items-start gap-4">
                <div className="rounded-full bg-primary/20 p-2 text-primary">
                  <Lightbulb className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium">Top Performing Course</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.insights.topCourse ? (
                      <>The highest performing course in this period is <strong>{data.insights.topCourse}</strong>.</>
                    ) : (
                      "Not enough data in this period."
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-primary/5 shadow-none">
              <CardContent className="pt-6 pb-6 flex items-start gap-4">
                <div className="rounded-full bg-primary/20 p-2 text-primary">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium">Primary Demographic</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.insights.topYear ? (
                      <><strong>{data.insights.topYear}</strong> students generated the highest number of enrollments this period.</>
                    ) : (
                      "Not enough data in this period."
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-primary/5 shadow-none">
              <CardContent className="pt-6 pb-6 flex items-start gap-4">
                <div className="rounded-full bg-primary/20 p-2 text-primary">
                  <LineIcon className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium">Enrollment Trend</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.insights.enrollmentTrend}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ANALYTICS ROW 1 */}
          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <ChartCard title="Enrollment Trend" description={`Sign-ups over the ${data.rangeLabel}.`}>
              {data.charts.enrollmentTrend.length === 0 ? (
                <EmptyState icon={LineIcon} message="No enrollments in this range yet." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.charts.enrollmentTrend} margin={{ left: -18, right: 8, top: 20 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" minTickGap={24} />
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

            <ChartCard title="Free vs Premium" description="Distribution of course types.">
              {data.charts.freeVsPremium.length === 0 || data.kpis.totalEnrollments === 0 ? (
                <EmptyState icon={PieIcon} message="No enrollments yet." />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data.charts.freeVsPremium}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Label
                          value={data.kpis.totalEnrollments.toLocaleString()}
                          position="center"
                          className="text-3xl font-bold fill-foreground"
                        />
                        <Label
                          value="Total"
                          position="center"
                          dy={24}
                          className="text-xs fill-muted-foreground"
                        />
                        {data.charts.freeVsPremium.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val} enrollments (${Math.round(val / data.kpis.totalEnrollments * 100)}%)`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    {data.charts.freeVsPremium.map((entry, i) => (
                      <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <div className="size-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="font-medium">{entry.name}</span>
                        <span className="text-muted-foreground">({Math.round(entry.value / data.kpis.totalEnrollments * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          {/* ANALYTICS ROW 2 */}
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Top Courses by Enrollment" description="Click a bar to filter.">
              {data.charts.coursePerformance.length === 0 ? (
                <EmptyState icon={BarChart3} message="No courses found." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.charts.coursePerformance} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={175}
                      tick={{ fontSize: 11 }}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
                    <Bar
                      dataKey="enrollments"
                      name="Enrollments"
                      radius={[0, 6, 6, 0]}
                      onClick={(d: { title?: string }) => d?.title && toggleCourse(d.title)}
                      className="cursor-pointer"
                    >
                      <LabelList dataKey="enrollments" position="right" fontSize={11} fill="var(--muted-foreground)" />
                      {data.charts.coursePerformance.slice(0, 8).map((c) => (
                        <Cell
                          key={c.id}
                          fill={course && course !== c.title ? "var(--chart-4)" : "var(--chart-1)"}
                          opacity={course && course !== c.title ? 0.35 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Student Year Distribution" description="Click a bar to filter.">
              {data.charts.studentYearDistribution.length === 0 ? (
                <EmptyState icon={Users} message="No enrollments in this range yet." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.charts.studentYearDistribution} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis dataKey="year" type="category" width={80} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
                    <Bar 
                      dataKey="count" 
                      name="Enrollments" 
                      radius={[0, 6, 6, 0]}
                      onClick={(d: { year?: string }) => d?.year && toggleYear(d.year)}
                      className="cursor-pointer"
                    >
                      <LabelList dataKey="count" position="right" fontSize={11} fill="var(--muted-foreground)" />
                      {data.charts.studentYearDistribution.map((c) => (
                        <Cell
                          key={c.year}
                          fill={year && year !== c.year ? "var(--chart-4)" : "var(--chart-2)"}
                          opacity={year && year !== c.year ? 0.35 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* ANALYTICS ROW 3 */}
          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <ChartCard title="Training & Program Performance" description="Registrations for immersive training programs.">
              {data.charts.trainingPerformance.length === 0 ? (
                <EmptyState icon={GraduationCap} message="No trainings found." />
              ) : (
                <div className="overflow-x-auto h-full">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-tl-md">Program Name</th>
                        <th className="px-4 py-3 font-medium">Registrations</th>
                        <th className="px-4 py-3 font-medium">Growth</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium rounded-tr-md">Popularity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {data.charts.trainingPerformance.map((t) => (
                        <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{t.title}</td>
                          <td className="px-4 py-3">{t.registrations.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={t.growth > 0 ? "text-emerald-500" : t.growth < 0 ? "text-red-500" : "text-muted-foreground"}>
                              {t.growth > 0 ? "+" : ""}{t.growth}%
                            </span>
                          </td>
                          <td className="px-4 py-3 capitalize">{t.status.replace("_", " ")}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              t.popularity === "High" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                              t.popularity === "Medium" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {t.popularity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Referral Analytics" description="Impact of peer-to-peer marketing.">
              <div className="flex flex-col gap-6 p-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <LinkIcon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Referral Enrollments</p>
                    <p className="text-2xl font-bold">{data.charts.referralAnalytics.totalReferralEnrollments.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <span className="text-sm text-muted-foreground">Referral Contribution</span>
                  <span className="font-medium">{data.charts.referralAnalytics.referralContribution}%</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <span className="text-sm text-muted-foreground">Top Referral Source</span>
                  <span className="font-medium truncate max-w-[150px]" title={data.charts.referralAnalytics.topReferralSource}>
                    {data.charts.referralAnalytics.topReferralSource}
                  </span>
                </div>
              </div>
            </ChartCard>
          </div>

        </div>
      )}
    </AppShell>
  );
}
