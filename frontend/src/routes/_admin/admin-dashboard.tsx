import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, Users, Briefcase, LogOut, Home, FileText, MonitorPlay, ShoppingBag, Package } from "lucide-react";
import { auth as oauthService } from "@/integrations/oauth";

export const Route = createFileRoute("/_admin/admin-dashboard")({
  component: AdminLayout,
});

const navLinks = [
  { to: "/admin-dashboard" as const, label: "Overview", icon: LayoutDashboard },
  { to: "/admin-dashboard/courses" as const, label: "Courses", icon: BookOpen },
  { to: "/admin-dashboard/trainings" as const, label: "Trainings", icon: MonitorPlay },
  { to: "/admin-dashboard/shop" as const, label: "Shop Products", icon: ShoppingBag },
  { to: "/admin-dashboard/shop/orders" as const, label: "Shop Orders", icon: Package },
  { to: "/admin-dashboard/users" as const, label: "Users", icon: Users },
  { to: "/admin-dashboard/internships" as const, label: "Internships", icon: Briefcase },
  { to: "/admin-dashboard/careers" as const, label: "Careers", icon: Briefcase },
  { to: "/admin-dashboard/applications" as const, label: "Applications", icon: FileText },
];

function AdminLayout() {
  const router = useRouter();

  const handleSignOut = async () => {
    await oauthService.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-60 flex-col border-r hairline bg-card px-4 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-paper text-[13px] font-medium">E</span>
          <div>
            <p className="text-sm font-semibold tracking-tight">Enginow</p>
            <p className="mono text-[10px] text-ink-mute uppercase tracking-widest">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-8 flex flex-col gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={to === "/admin-dashboard" ? { exact: true } : {}}
              activeProps={{ className: "bg-secondary text-ink font-medium" }}
              inactiveProps={{ className: "text-ink-soft hover:bg-secondary/60 hover:text-ink" }}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto flex flex-col gap-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] text-ink-soft transition-colors hover:bg-secondary/60 hover:text-ink"
          >
            <Home className="h-4 w-4" />
            Back to site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] text-ink-soft transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
