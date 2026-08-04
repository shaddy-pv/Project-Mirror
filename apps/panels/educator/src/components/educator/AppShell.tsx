import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, FileText, LayoutDashboard, LogOut, Newspaper, Settings } from "lucide-react";

import { useSession } from "@/lib/role";
import { cn } from "@/lib/utils";
import { HelpDrawer } from "./HelpDrawer";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/courses", label: "Courses & Training", icon: BookOpen, exact: false },
  { to: "/blogs", label: "Blogs", icon: Newspaper, exact: false },
  { to: "/resources", label: "Resources", icon: FileText, exact: false },
  { to: "/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export function AppShell({
  title,
  description,
  help,
  actions,
  children,
}: {
  title: string;
  description?: string;
  help: { title: string; lines: string[] };
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { name, email, logout } = useSession();

  return (
    <div className="flex min-h-screen w-full bg-background font-sans">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
        <div className="px-2">
          <p className="text-lg font-semibold tracking-tight text-sidebar-accent-foreground">Enginow</p>
          <p className="text-xs text-sidebar-foreground/60">Educator panel</p>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 rounded-md bg-sidebar-accent/50 px-3 py-3 flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{email}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-6 py-4 backdrop-blur">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description && <p className="mt-0.5 truncate text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <HelpDrawer title={help.title} lines={help.lines} />
            <button
              onClick={logout}
              className="text-xs text-muted-foreground hover:text-destructive border border-border px-2.5 py-1.5 rounded flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </button>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
