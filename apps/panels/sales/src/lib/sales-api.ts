import { resolveRange, type RangePreset, type RangeSelection, type DashboardFilters, type DashboardData, type SalesProfile } from "./sales-types";

export type InquiryStatus = "New" | "In Progress" | "Closed";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  date: string;
  category: string;
  status: InquiryStatus;
  message: string;
}

const API_URL = "http://localhost:5000/api";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("x-mock-role", "sales");
  headers.set("Authorization", "Bearer mock-token");
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchDashboard(
  sel: RangeSelection,
  filters: DashboardFilters = {},
): Promise<DashboardData> {
  const backendStats = await fetchApi("/sales/dashboard");
  const { label } = resolveRange(sel);
  
  // Map backend stats to the required frontend format
  return {
    rangeLabel: label,
    kpis: {
      enrollments: backendStats.totalEnrollments,
      learners: backendStats.totalEnrollments, // simplified
      topCourse: null,
      growthPct: null,
    },
    topCourses: [],
    trend: [],
    byYear: [],
    byCollege: [],
    referrers: [
      { name: "Total Referrals", code: "ALL", signups: backendStats.totalReferralUses, enrollments: backendStats.totalReferralUses }
    ],
  };
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const data = await fetchApi("/inquiries?category=sales");
  return data.map((i: any) => ({
    id: i.id,
    name: i.name,
    email: i.email,
    date: i.createdAt,
    category: "Sales",
    status: i.status === "new" ? "New" : i.status === "reviewed" ? "In Progress" : "Closed",
    message: i.message,
  }));
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
  const backendStatus = status === "New" ? "new" : status === "In Progress" ? "reviewed" : "resolved";
  await fetchApi(`/inquiries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: backendStatus }) });
  return { id, status } as any; 
}

export async function fetchProfile(): Promise<SalesProfile> {
  return {
    name: "Sales Rep",
    email: "sales@enginow.com",
    phone: "",
    notifyNewInquiry: true,
    notifyWeeklySummary: true,
    notifyBigJumps: false,
  };
}

export async function saveProfile(next: Partial<SalesProfile>): Promise<SalesProfile> {
  return {
    name: "Sales Rep",
    email: "sales@enginow.com",
    phone: "",
    notifyNewInquiry: true,
    notifyWeeklySummary: true,
    notifyBigJumps: false,
    ...next,
  };
}

export { PRESET_LABELS, resolveRange } from "./sales-types";
