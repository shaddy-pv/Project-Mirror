import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Users, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { adminGetStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin-dashboard/")({
  loader: () => adminGetStats(),
  component: AdminOverview,
});

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border hairline bg-card p-6"
    >
      <div className={`inline-grid h-10 w-10 place-items-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mono mt-1 text-[11px] uppercase tracking-widest text-ink-mute">{label}</p>
    </motion.div>
  );
}

function AdminOverview() {
  const stats = Route.useLoaderData();

  return (
    <div className="px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-1 text-[13.5px] text-ink-soft">Welcome to the Enginow admin panel.</p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard label="Total Courses" value={stats?.totalCourses ?? 0} icon={BookOpen} color="bg-violet-50 text-violet-600" />
        <StatCard label="Total Enrollments" value={stats?.totalEnrollments ?? 0} icon={GraduationCap} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Quick links */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: "/admin-dashboard/courses/new", label: "Create a Course", desc: "Add a new course to the platform" },
          { to: "/admin-dashboard/internships/new", label: "Create an Internship", desc: "Add a summer/winter/spring/monsoon internship listing" },
          { to: "/admin-dashboard/users", label: "Manage Users", desc: "View all learners and their details" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-xl border hairline bg-card p-5 transition-colors hover:border-ink/20"
          >
            <p className="font-medium">{item.label}</p>
            <p className="mt-1 text-[13px] text-ink-soft">{item.desc}</p>
            <ArrowRight className="mt-4 h-4 w-4 text-ink-mute transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
