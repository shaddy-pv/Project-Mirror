import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, MessageSquare, Settings, ShieldCheck } from "lucide-react";

// Mock session for the Sales role. In the full panel this comes from the
// shared auth store; the route tree below is only reachable with role "sales".
export const SESSION = { name: "Riya Malhotra", email: "riya.malhotra@enginow.in", role: "sales" as const };

export function RoleGuard({ children }: { children: ReactNode }) {
  if (SESSION.role !== "sales") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-lg font-semibold">You don't have access to this area</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ask an admin to grant you Sales access.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

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

  return (
    <RoleGuard>
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

          <div className="rounded-lg bg-sidebar-accent/50 px-3 py-3">
            <p className="text-sm font-medium text-sidebar-accent-foreground">{SESSION.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{SESSION.email}</p>
          </div>
        </aside>

        <div className="lg:pl-60">
          <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 lg:px-8">
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
                {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
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
    </RoleGuard>
  );
}
