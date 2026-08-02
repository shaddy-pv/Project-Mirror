import { session } from "./role";
import type { Applicant, Assessment, Blog, HrProfile, Inquiry, Listing, Season, SeasonName, Stage } from "./mock/db";

const API_URL = "http://localhost:5000/api";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("x-mock-role", session.role);
  headers.set("Authorization", "Bearer mock-token");
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  async listings(): Promise<Listing[]> {
    // Merge careers and internships for HR listings view
    const [careers, internships] = await Promise.all([
      fetchApi("/admin/careers"),
      fetchApi("/admin/internships"),
    ]);
    return [...careers.map((c: any) => ({ ...c, type: "Job" })), ...internships.map((i: any) => ({ ...i, type: "Internship" }))];
  },
  async listing(id: string): Promise<Listing | undefined> {
    const listings = await this.listings();
    return listings.find(l => l.id === id);
  },
  async createListing(input: any): Promise<Listing> {
    const route = input.type === "Internship" ? "/admin/internships" : "/admin/careers";
    return fetchApi(route, { method: "POST", body: JSON.stringify(input) });
  },
  async updateListing(id: string, patch: any): Promise<Listing> {
    const listing = await this.listing(id);
    const route = listing?.type === "Internship" ? `/admin/internships/${id}` : `/admin/careers/${id}`;
    return fetchApi(route, { method: "PUT", body: JSON.stringify(patch) });
  },
  async closeListing(id: string): Promise<Listing> {
    return this.updateListing(id, { status: "closed" });
  },
  async reopenListing(id: string): Promise<Listing> {
    return this.updateListing(id, { status: "open" });
  },
  async removeListing(id: string): Promise<void> {
    const listing = await this.listing(id);
    const route = listing?.type === "Internship" ? `/admin/internships/${id}` : `/admin/careers/${id}`;
    return fetchApi(route, { method: "DELETE" });
  },

  async applicants(filter?: { listingId?: string; season?: SeasonName }): Promise<Applicant[]> {
    // If listingId is provided, we can fetch for that specific listing. For mock parity, let's fetch all and filter or use endpoints.
    // Assuming backend returns internship-applications and career-applications
    const [internApps, careerApps] = await Promise.all([
      fetchApi("/admin/internship-applications" + (filter?.listingId ? `?internshipId=${filter.listingId}` : "")),
      fetchApi("/admin/career-applications" + (filter?.listingId ? `?careerId=${filter.listingId}` : "")),
    ]);
    return [...internApps, ...careerApps].map(app => ({
       ...app,
       appliedAt: app.appliedAt || app.createdAt,
       stage: app.status
    }));
  },
  async moveApplicant(id: string, stage: Stage): Promise<Applicant> {
    // Not sure if it's an internship or career app from just ID, so we might need to try both or assume status patch
    // For now we'll try internship first then career
    try {
      return await fetchApi(`/admin/internship-applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: stage }) });
    } catch {
      return await fetchApi(`/admin/career-applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: stage }) });
    }
  },

  async blogs(): Promise<Blog[]> {
    return fetchApi("/blogs");
  },
  async blog(id: string): Promise<Blog | undefined> {
    return fetchApi(`/blogs/${id}`);
  },
  async saveBlog(input: any): Promise<Blog> {
    if (input.id) return fetchApi(`/blogs/${input.id}`, { method: "PUT", body: JSON.stringify(input) });
    return fetchApi("/blogs", { method: "POST", body: JSON.stringify(input) });
  },
  async deleteBlog(id: string): Promise<void> {
    return fetchApi(`/blogs/${id}`, { method: "DELETE" });
  },

  async seasons(): Promise<Season[]> {
    return fetchApi("/admin/seasons");
  },
  async updateSeason(name: SeasonName, openAt: string, closeAt: string): Promise<Season> {
    return fetchApi(`/admin/seasons/${name}`, { method: "PUT", body: JSON.stringify({ openAt, closeAt }) });
  },

  async assessments(listingId: string): Promise<Assessment[]> {
    return fetchApi(`/assessments?listingId=${listingId}`);
  },
  async createAssessment(input: any): Promise<Assessment> {
    return fetchApi("/assessments", { method: "POST", body: JSON.stringify(input) });
  },
  async updateAssessment(id: string, patch: Partial<Assessment>): Promise<Assessment> {
    return fetchApi(`/assessments/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  },

  async inquiries(): Promise<Inquiry[]> {
    return fetchApi("/inquiries?category=career");
  },
  async updateInquiry(id: string, status: "new" | "reviewed" | "resolved"): Promise<Inquiry> {
    return fetchApi(`/inquiries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  },

  async profile(): Promise<HrProfile> {
    return { name: "HR Manager", email: "hr@enginow.com", role: "hr" };
  },
  async updateProfile(patch: Partial<HrProfile>): Promise<HrProfile> {
    return { name: "HR Manager", email: "hr@enginow.com", role: "hr", ...patch };
  },
};
