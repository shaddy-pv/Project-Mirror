export type RangePreset = "7d" | "30d" | "year" | "custom";

export type RangeSelection = {
  preset: RangePreset;
  from?: string | undefined;
  to?: string | undefined;
};

export const PRESET_LABELS: Record<RangePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  year: "This year",
  custom: "Custom range",
};

const DAY = 86400000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const TODAY = new Date();

export function resolveRange(sel: RangeSelection) {
  if (sel.preset === "custom" && sel.from && sel.to) {
    const days = Math.max(1, Math.round((+new Date(sel.to) - +new Date(sel.from)) / DAY) + 1);
    return { from: sel.from, to: sel.to, days, label: `${sel.from} to ${sel.to}` };
  }
  const to = iso(TODAY);
  if (sel.preset === "year") {
    const from = `${TODAY.getUTCFullYear()}-01-01`;
    const days = Math.round((+TODAY - +new Date(from)) / DAY) + 1;
    return { from, to, days, label: "this year" };
  }
  const days = sel.preset === "7d" ? 7 : 30;
  return { from: iso(new Date(+TODAY - (days - 1) * DAY)), to, days, label: PRESET_LABELS[sel.preset].toLowerCase() };
}

export type DashboardFilters = {
  course?: string | null;
  college?: string | null;
};

export type DashboardData = {
  rangeLabel: string;
  kpis: {
    enrollments: number;
    learners: number;
    topCourse: { name: string; count: number } | null;
    growthPct: number | null;
  };
  topCourses: Array<{ name: string; count: number }>;
  trend: Array<{ label: string; count: number }>;
  byYear: Array<{ label: string; count: number }>;
  byCollege: Array<{ label: string; count: number }>;
  referrers: Array<{ name: string; code: string; signups: number; enrollments: number }>;
};

export type SalesProfile = {
  name: string;
  email: string;
  phone: string;
  notifyNewInquiry: boolean;
  notifyWeeklySummary: boolean;
  notifyBigJumps: boolean;
};
