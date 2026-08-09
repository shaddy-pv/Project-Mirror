import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/panel/PageHeader";
import { CodeChip } from "@/components/panel/CodeChip";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/session";
import { getDashboard } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Enginow Panel" },
      {
        name: "description",
        content: "Daily numbers for the Enginow team: signups, enrolments, approvals and referrals.",
      },
      { property: "og:title", content: "Dashboard — Enginow Panel" },
      {
        property: "og:description",
        content: "Daily numbers for the Enginow team: signups, enrolments, approvals and referrals.",
      },
    ],
  }),
  component: DashboardPage,
});

function Kpi({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { role, name } = useSession();
  const { data, isPending } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  const showPeople = role === "admin";
  const showApprovals = role === "admin";

  return (
    <div>
      <PageHeader
        title={`Good to see you, ${name.split(" ")[0]}`}
        subtitle="A quick read on how Enginow is doing today. Everything here updates on its own."
        helpTitle="What this page is for"
        helpLines={[
          "This is your daily summary. The cards at the top show the headline numbers, and the charts below show how they're moving over time.",
          "Nothing on this page can be broken by clicking — it's read-only.",
          "You only see the numbers that relate to your work, so your view may look shorter than a teammate's.",
        ]}
      />

      {isPending || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {showPeople && (
              <>
                <Kpi label="Total people signed up" value={data.totalUsers} hint="Learners, interns and applicants" />
                <Kpi label="New in the last 7 days" value={data.newSignups7d} hint={`${data.newSignups30d} in the last 30 days`} />
              </>
            )}
            <Kpi label="Courses running now" value={data.activeCourses} hint="Live and visible on the website" />
            {showApprovals && (
              <Kpi label="Waiting for your approval" value={data.pendingApprovals} hint="Open the Approvals Inbox to clear these" />
            )}
            <Kpi label="Open job & internship listings" value={data.openListings} hint="Still accepting applications" />
            <Kpi label="Enrolments this month" value={data.monthEnrollments} hint="People who joined a course" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enrolments month by month</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="enrollments"
                      name="Enrolments"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most popular courses</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topCourses} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={140}
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                    />
                    <Tooltip />
                    <Bar dataKey="enrollments" name="Enrolments" fill="var(--color-chart-1)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {showPeople && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 10 people bringing in referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Referral code</TableHead>
                      <TableHead className="text-right">People referred</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.leaderboard.map((r: { name: string; code: string; referrals: number }) => (
                      <TableRow key={r.code}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>
                          <CodeChip code={r.code} label="Referral code" />
                        </TableCell>
                        <TableCell className="text-right">{r.referrals}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
