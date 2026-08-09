// ─── HR Panel API Client ─────────────────────────────────────────────────────
// Connects to the Enginow backend. All data comes from MongoDB via /api/admin/*

const BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, "") : "http://localhost:5000";
const STORAGE_KEY = "enginow_hr_auth";

function getToken(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "";
    return JSON.parse(raw)?.token || "";
  } catch {
    return "";
  }
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  } as RequestInit);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type Stage = "Applied" | "Shortlisted" | "OA" | "Selected";
export type ListingKind = "job" | "internship";
export type ListingStatus = "draft" | "pending_approval" | "open" | "closed" | "expired";
export type BlogStatus = "draft" | "pending_approval" | "Published" | "rejected";
export type InquiryStatus = "new" | "reviewed" | "resolved";
export type SeasonName = "Summer" | "Monsoon" | "Spring" | "Winter";

export const STAGES: Stage[] = ["Applied", "Shortlisted", "OA", "Selected"];

export const DOMAINS = [
  "Frontend Engineering",
  "Backend Engineering",
  "Data Science",
  "Design",
  "Content & Marketing",
  "Operations",
];

export interface Listing {
  id: string;
  title: string;
  kind: ListingKind;
  domain: string;
  locationType: string;
  type: string;
  status: ListingStatus;
  isOpen: boolean;
  applicantsCount: number;
  createdAt: string;
  openFrom?: string;
  openUntil?: string;
  description?: string;
  requirements?: string[];
  perks?: string[];
  responsibilities?: string;
  salary?: string;
  company?: string;
}

export interface StageEvent {
  stage: Stage;
  at: string;
  by: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: Stage;
  careerId: string;
  listingId?: string;
  season?: SeasonName;
  appliedAt: string;
  resumeUrl?: string;
  answers?: { question: string; answer: string }[];
  history?: StageEvent[];
  kind?: "job" | "internship";
}

export interface Blog {
  id: string;
  title: string;
  excerpt?: string;
  body?: string;
  bannerUrl?: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface Season {
  id: string;
  name: SeasonName;
  startsText: string;
  applicationsOpen: boolean;
  domains: string[];
}

export interface Assessment {
  id: string;
  title: string;
  domain?: string;
  listingId: string;
  listingType: string;
  status: "Draft" | "Live" | "Closed";
  durationMins?: number;
  createdAt: string;
  modules?: any[];
  questions?: any[];
  results?: any[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface HrDashboard {
  activeListings: number;
  totalApplicants: number;
  activeAssessments: number;
  unreadInquiries: number;
  pipeline: { applied: number; shortlisted: number; oa: number; selected: number };
  recentApplicants: Applicant[];
}

export interface HrProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  phone?: string;
  settings?: Record<string, unknown>;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const qk = {
  dashboard: ["hr", "dashboard"] as const,
  listings: ["hr", "listings"] as const,
  listing: (id: string) => ["hr", "listing", id] as const,
  applicants: (filter?: { listingId?: string }) => ["hr", "applicants", filter] as const,
  blogs: ["hr", "blogs"] as const,
  blog: (id: string) => ["hr", "blog", id] as const,
  seasons: ["hr", "seasons"] as const,
  assessments: ["hr", "assessments"] as const,
  assessment: (id: string) => ["hr", "assessment", id] as const,
  inquiries: ["hr", "inquiries"] as const,
  profile: ["hr", "profile"] as const,
};

// ─── API Object ───────────────────────────────────────────────────────────────

export const api = {
  // ─── Dashboard ─────────────────────────────────────────────────────────────
  async dashboard(): Promise<HrDashboard> {
    return req("GET", "/api/admin/hr/dashboard");
  },

  // ─── Listings ──────────────────────────────────────────────────────────────
  async listings(): Promise<Listing[]> {
    const [careers, internships] = await Promise.all([
      req<Listing[]>("GET", "/api/admin/careers").catch(() => []),
      req<Listing[]>("GET", "/api/admin/internships").catch(() => [])
    ]);
    return [
      ...careers.map(c => ({ ...c, kind: "job" as ListingKind })),
      ...internships.map(i => ({ ...i, kind: "internship" as ListingKind }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async listing(id: string): Promise<Listing> {
    try {
      const c = await req<Listing>("GET", `/api/admin/careers/${id}`);
      return { ...c, kind: "job" };
    } catch {
      const i = await req<Listing>("GET", `/api/admin/internships/${id}`);
      return { ...i, kind: "internship" };
    }
  },

  async createListing(input: Partial<Listing>): Promise<Listing> {
    const endpoint = input.kind === "internship" ? "/api/admin/internships" : "/api/admin/careers";
    return req("POST", endpoint, input);
  },

  async updateListing(id: string, patch: Partial<Listing>): Promise<Listing> {
    const endpoint = patch.kind === "internship" ? `/api/admin/internships/${id}` : `/api/admin/careers/${id}`;
    return req("PUT", endpoint, patch);
  },

  async closeListing(id: string, kind: ListingKind = "job"): Promise<Listing> {
    const endpoint = kind === "internship" ? `/api/admin/internships/${id}` : `/api/admin/careers/${id}`;
    return req("PUT", endpoint, { status: "closed" });
  },

  async reopenListing(id: string, kind: ListingKind = "job"): Promise<Listing> {
    const endpoint = kind === "internship" ? `/api/admin/internships/${id}` : `/api/admin/careers/${id}`;
    return req("PUT", endpoint, { status: "open" });
  },

  async removeListing(id: string, kind: ListingKind = "job"): Promise<void> {
    const endpoint = kind === "internship" ? `/api/admin/internships/${id}` : `/api/admin/careers/${id}`;
    return req("DELETE", endpoint);
  },

  async applicants(filter?: { listingId?: string }): Promise<Applicant[]> {
    const careerParams = new URLSearchParams();
    const internParams = new URLSearchParams();
    if (filter?.listingId) {
      careerParams.set("careerId", filter.listingId);
      internParams.set("internshipId", filter.listingId);
    }
    
    const [cApps, iApps] = await Promise.all([
      req<any[]>("GET", `/api/admin/career-applications?${careerParams.toString()}`).catch(() => []),
      req<any[]>("GET", `/api/admin/internship-applications?${internParams.toString()}`).catch(() => [])
    ]);

    const formattedInterns = iApps.map(a => ({
      ...a,
      kind: "internship" as const,
      careerId: a.internshipId,
      stage: (a.status === "pending" || a.status === "reviewing") ? "Applied" : 
             (a.status === "shortlisted") ? "Shortlisted" : 
             (a.status === "oa" || a.status === "oa-cleared" || a.status === "oa-failed") ? "OA" : 
             (a.status === "selected") ? "Selected" : "Applied"
    }));

    const formattedCareers = cApps.map(a => ({
      ...a,
      kind: "job" as const
    }));

    return [...formattedCareers, ...formattedInterns].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  async moveApplicant(id: string, stage: Stage, kind: ListingKind = "job"): Promise<void> {
    if (kind === "internship") {
      const statusMap: Record<Stage, string> = {
        Applied: "pending",
        Shortlisted: "shortlisted",
        OA: "oa",
        Selected: "selected"
      };
      return req("PATCH", `/api/admin/internship-applications/${id}/status`, { status: statusMap[stage] });
    }
    return req("PATCH", `/api/admin/career-applications/${id}/stage`, { stage });
  },

  // ─── Blogs ─────────────────────────────────────────────────────────────────
  async blogs(): Promise<Blog[]> {
    const data: any[] = await req("GET", "/api/admin/blogs");
    // Only show blogs created by this HR user (backend already filters by authorId)
    return data;
  },

  async blog(id: string): Promise<Blog> {
    return req("GET", `/api/admin/blogs/${id}`);
  },

  async createBlog(input: Partial<Blog>): Promise<Blog> {
    return req("POST", "/api/admin/blogs", input);
  },

  async updateBlog(id: string, patch: Partial<Blog>): Promise<Blog> {
    return req("PUT", `/api/admin/blogs/${id}`, patch);
  },

  async saveBlog(input: Partial<Blog> & { title: string }): Promise<Blog> {
    if (input.id) {
      const { id, ...rest } = input;
      return this.updateBlog(id, rest);
    }
    return this.createBlog(input);
  },

  async deleteBlog(id: string): Promise<void> {
    return req("DELETE", `/api/admin/blogs/${id}`);
  },

  // ─── Seasons ───────────────────────────────────────────────────────────────
  async seasons(): Promise<Season[]> {
    return req("GET", "/api/admin/internship-seasons");
  },

  async updateSeason(id: string, patch: Partial<Season>): Promise<void> {
    return req("PUT", `/api/admin/internship-seasons/${id}`, patch);
  },

  // ─── Assessments ───────────────────────────────────────────────────────────
  async assessments(listingId?: string): Promise<Assessment[]> {
    const all: Assessment[] = await req("GET", "/api/assessments");
    if (listingId) return all.filter((a) => a.listingId === listingId);
    return all;
  },

  async assessment(id: string): Promise<Assessment> {
    return req("GET", `/api/assessments/${id}/edit`);
  },

  async createAssessment(input: Partial<Assessment>): Promise<{ id: string }> {
    return req("POST", "/api/assessments", input);
  },

  async updateAssessment(id: string, patch: Partial<Assessment>): Promise<void> {
    return req("PUT", `/api/assessments/${id}`, patch);
  },

  // ─── Inquiries ─────────────────────────────────────────────────────────────
  async inquiries(): Promise<Inquiry[]> {
    return req("GET", "/api/inquiries?category=career");
  },

  async updateInquiry(id: string, status: InquiryStatus): Promise<void> {
    return req("PATCH", `/api/inquiries/${id}/status`, { status });
  },

  // ─── Profile / Settings ────────────────────────────────────────────────────
  async profile(): Promise<HrProfile> {
    const data: { staff: HrProfile } = await req("GET", "/api/staff/me");
    return data.staff;
  },

  async updateProfile(patch: Partial<HrProfile>): Promise<HrProfile> {
    const data: { staff: HrProfile } = await req("PATCH", "/api/staff/me", patch);
    return data.staff;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return req("PATCH", "/api/staff/change-password", { currentPassword, newPassword });
  },
};
