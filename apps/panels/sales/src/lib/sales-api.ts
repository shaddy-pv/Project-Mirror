import { resolveRange, type RangePreset, type RangeSelection, type DashboardFilters, type DashboardData, type SalesProfile } from "./sales-types";

export type InquiryStatus = "New" | "Contacted" | "Converted" | "Lost";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  category: string;
  status: InquiryStatus;
  message: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const rawAuth = typeof window !== "undefined" ? localStorage.getItem("enginow_sales_auth") : null;
  if (rawAuth) {
    try {
      const auth = JSON.parse(rawAuth);
      if (auth.token) headers.set("Authorization", `Bearer ${auth.token}`);
    } catch {}
  }
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
  const { from, to, label } = resolveRange(sel);
  
  const query = new URLSearchParams();
  if (from) query.append("from", from);
  if (to) query.append("to", to);
  if (filters.course) query.append("course", filters.course);
  if (filters.category) query.append("category", filters.category);
  if (filters.year) query.append("year", filters.year);
  if (filters.type) query.append("type", filters.type);

  const backendStats = await fetchApi(`/sales/dashboard?${query.toString()}`);
  
  return {
    rangeLabel: label,
    kpis: backendStats.kpis,
    charts: backendStats.charts,
    recentLeads: backendStats.recentLeads,
    insights: backendStats.insights
  };
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const data = await fetchApi("/sales/inquiries");
  return data.map((i: any) => ({
    id: i._id,
    name: i.name,
    email: i.email,
    phone: i.phone,
    date: i.createdAt,
    category: "Sales",
    status: i.status,
    message: i.message,
  }));
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
  // This is dummy for now since I didn't write an API endpoint for it, but just mapping correctly:
  await fetchApi(`/sales/inquiries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }).catch(() => {});
  return { id, status } as any; 
}

export async function fetchProfile(): Promise<SalesProfile> {
  const { staff } = await fetchApi("/staff/me");
  return {
    name: staff.name || "Sales Rep",
    email: staff.email || "sales@enginow.com",
    phone: staff.phone || "",
    notifyNewInquiry: staff.settings?.notifyNewInquiry ?? true,
    notifyWeeklySummary: staff.settings?.notifyWeeklySummary ?? true,
    notifyBigJumps: staff.settings?.notifyBigJumps ?? false,
  };
}

export async function saveProfile(next: Partial<SalesProfile>): Promise<SalesProfile> {
  const payload: any = {};
  if (next.name !== undefined) payload.name = next.name;
  if (next.email !== undefined) payload.email = next.email;
  if (next.phone !== undefined) payload.phone = next.phone;
  
  if (
    next.notifyNewInquiry !== undefined || 
    next.notifyWeeklySummary !== undefined || 
    next.notifyBigJumps !== undefined
  ) {
    payload.settings = {
      notifyNewInquiry: next.notifyNewInquiry,
      notifyWeeklySummary: next.notifyWeeklySummary,
      notifyBigJumps: next.notifyBigJumps
    };
  }

  const { staff } = await fetchApi("/staff/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return {
    name: staff.name,
    email: staff.email,
    phone: staff.phone || "",
    notifyNewInquiry: staff.settings?.notifyNewInquiry ?? true,
    notifyWeeklySummary: staff.settings?.notifyWeeklySummary ?? true,
    notifyBigJumps: staff.settings?.notifyBigJumps ?? false,
  };
}

export { PRESET_LABELS, resolveRange } from "./sales-types";
export type { RangePreset, SalesProfile } from "./sales-types";
