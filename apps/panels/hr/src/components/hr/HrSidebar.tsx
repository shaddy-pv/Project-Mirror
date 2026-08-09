import { Link, useRouterState } from "@tanstack/react-router";
import {
  Briefcase,
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/lib/store";
import { api, qk } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/careers/listings", label: "Jobs & Internships", icon: Briefcase, group: "Careers" },
  { to: "/careers/seasons", label: "Internship Seasons", icon: CalendarRange, group: "Careers" },
  { to: "/assessments", label: "Assessments", icon: ClipboardList },
  { to: "/blogs", label: "Blogs", icon: Newspaper },
  { to: "/inquiries", label: "Contact Inquiries", icon: Mail },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function HrSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout } = useSession();
  const { data: profile } = useQuery({ queryKey: qk.profile, queryFn: api.profile });
  const displayName = profile?.name ?? "HR Staff";
  const displayEmail = profile?.email ?? "";

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-ink text-ink-foreground lg:flex">
      <div className="px-5 py-5">
        <p className="text-base font-semibold tracking-tight">Enginow</p>
        <p className="text-xs text-ink-muted">HR panel</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-6">
        {NAV.map((item, i) => {
          const prev = i > 0 ? NAV[i - 1] : undefined;
          const group = "group" in item ? item.group : undefined;
          const prevGroup = prev && "group" in prev ? prev.group : undefined;
          const Icon = item.icon;
          return (
            <div key={item.to}>
              {group && group !== prevGroup && (
                <p className="px-3 pt-4 pb-1 text-[11px] font-medium tracking-wide text-ink-muted uppercase">
                  {group}
                </p>
              )}
              <Link
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  group && "ml-2",
                  isActive(item.to, "exact" in item ? item.exact : false)
                    ? "bg-brand text-brand-foreground"
                    : "text-ink-muted hover:bg-ink-hover hover:text-ink-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-ink-hover px-5 py-4 text-xs text-ink-muted flex items-center justify-between">
        <div>
          <p className="font-semibold text-ink-foreground">{displayName}</p>
          <p className="text-[11px] text-ink-muted">{displayEmail}</p>
        </div>
        <button
          onClick={logout}
          className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded"
        >
          <LogOut className="size-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="sticky top-0 z-30 flex gap-1 overflow-x-auto bg-ink px-3 py-2 text-sm lg:hidden">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "rounded-lg px-3 py-1.5 whitespace-nowrap",
            (("exact" in item && item.exact) ? pathname === item.to : pathname.startsWith(item.to))
              ? "bg-brand text-brand-foreground"
              : "text-ink-muted",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
