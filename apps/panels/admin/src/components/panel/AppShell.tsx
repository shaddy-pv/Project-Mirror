import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { canAccess, useSession, type ModuleKey } from "@/lib/session";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { listApprovals } from "@/mocks/api";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; icon: typeof Users; module: ModuleKey }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { to: "/approvals", label: "Approvals Inbox", icon: Inbox, module: "approvals" },
  { to: "/users", label: "Users & Referrals", icon: Users, module: "users" },
  { to: "/courses", label: "Courses & Training", icon: BookOpen, module: "courses" },
  { to: "/internships", label: "Internships", icon: Briefcase, module: "internships" },
  { to: "/careers", label: "Careers", icon: Building2, module: "careers" },
  { to: "/shop", label: "Shop", icon: ShoppingBag, module: "shop" },
  { to: "/blogs", label: "Blogs", icon: FileText, module: "blogs" },
  { to: "/settings", label: "Settings", icon: Settings, module: "settings" },
];

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/approvals": "Approvals Inbox",
  "/users": "Users & Referrals",
  "/courses": "Courses & Training",
  "/internships": "Internships",
  "/careers": "Careers",
  "/shop": "Shop",
  "/blogs": "Blogs",
  "/settings": "Settings",
};

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { role, name, email, logout } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: approvals } = useQuery({ queryKey: ["approvals"], queryFn: listApprovals });
  const pending = approvals?.length ?? 0;

  const items = NAV.filter((n) => canAccess(role, n.module));

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col bg-sidebar text-sidebar-foreground",
          open ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="flex h-16 items-center gap-2 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            E
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-sidebar-accent-foreground">Enginow Panel</p>
            <p className="text-xs text-sidebar-foreground/60">Internal team tools</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.module === "approvals" && pending > 0 && (
                  <span className="rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-warning-foreground">
                    {pending}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/60 flex items-center justify-between">
          <div>
            <p className="font-medium text-sidebar-foreground">{name}</p>
            <p className="text-[11px] text-muted-foreground">{email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-8">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h2 className="flex-1 truncate text-sm font-medium text-muted-foreground">
            {TITLES[pathname] ?? "Enginow Panel"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded font-semibold uppercase">
              {ROLE_LABELS[role]} Portal
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs h-8 gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
