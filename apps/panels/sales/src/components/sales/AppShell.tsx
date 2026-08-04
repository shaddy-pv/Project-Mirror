import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, LogOut, MessageSquare, Settings, ShieldCheck } from "lucide-react";
import { useSalesAuth } from "@/store/useSalesAuth";

const NAV = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/inquiries", label: "Contact Inquiries", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { name, email, logout } = useSalesAuth();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-sidebar-accent-foreground">Enginow</p>
            <p className="text-xs text-sidebar-foreground/60">Sales panel</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-lg bg-sidebar-accent/50 px-3 py-3 flex items-center justify-between">
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

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 lg:px-8">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <button
                onClick={logout}
                className="text-xs text-muted-foreground hover:text-destructive border border-border px-2.5 py-1.5 rounded flex items-center gap-1.5"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${
                  pathname === to ? "bg-secondary font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
