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
  year?: string | null;
  category?: string | null;
  type?: string | null;
};

export type DashboardData = {
  rangeLabel: string;
  kpis: {
    totalEnrollments: number;
    enrollmentGrowth: number;
    activeLearners: number;
    premiumEnrollments: number;
    totalLeads: number;
    conversionRate: number;
  };
  charts: {
    enrollmentTrend: Array<{ date: string; count: number }>;
    freeVsPremium: Array<{ name: string; value: number }>;
    studentYearDistribution: Array<{ year: string; count: number }>;
    coursePerformance: Array<{ id: string; title: string; category: string; type: string; enrollments: number; revenue: number }>;
    categoryPerformance: Array<{ category: string; enrollments: number }>;
    trainingPerformance: Array<{ id: string; title: string; registrations: number; growth: number; status: string; popularity: string }>;
    referralAnalytics: {
      totalReferralEnrollments: number;
      referralConversions: number;
      topReferralSource: string;
      referralContribution: number;
    };
  };
  recentLeads: Array<any>;
  insights: {
    topCourse: string | null;
    topYear: string | null;
    enrollmentTrend: string | null;
  };
};

export type SalesProfile = {
  name: string;
  email: string;
  phone: string;
  notifyNewInquiry: boolean;
  notifyWeeklySummary: boolean;
  notifyBigJumps: boolean;
};
