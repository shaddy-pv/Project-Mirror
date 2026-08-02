import type { Blog, Course, PanelUser } from "@/lib/types";

const API_URL = "http://localhost:5000/api";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("x-mock-role", "admin");
  headers.set("Authorization", "Bearer mock-token");
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.statusText}`);
  }
  return res.json();
}

export async function listUsers(): Promise<PanelUser[]> {
  return fetchApi("/users"); // Assuming we have an admin user listing endpoint
}

export async function setUserActive(id: string, active: boolean) {
  // Not implemented in backend, mock for now
  return { id, active } as any;
}

export async function updateUser(id: string, patch: Partial<PanelUser>) {
  return { id, ...patch } as any;
}

export async function regenerateReferralCode(id: string) {
  return "MOCKCODE"; // Not implemented in backend
}

export async function listCourses(): Promise<Course[]> {
  return fetchApi("/admin/courses");
}

export async function saveCourse(input: Partial<Course> & { id?: string }): Promise<Course> {
  if (input.id) {
    const route = input.kind === "training" ? `/admin/trainings/${input.id}` : `/admin/courses/${input.id}`;
    return fetchApi(route, { method: "PUT", body: JSON.stringify(input) });
  }
  const route = input.kind === "training" ? `/admin/trainings` : `/admin/courses`;
  return fetchApi(route, { method: "POST", body: JSON.stringify(input) });
}

export async function setCourseStatus(id: string, status: Course["status"], reason?: string) {
  const action = status === "live" ? "approve" : "reject";
  const body = action === "reject" ? JSON.stringify({ reason }) : undefined;
  return fetchApi(`/admin/courses/${id}/${action}`, { method: "PATCH", body });
}

export async function listBlogs(): Promise<Blog[]> {
  return fetchApi("/blogs");
}

export async function saveBlog(input: Partial<Blog> & { id?: string }): Promise<Blog> {
  if (input.id) {
    return fetchApi(`/blogs/${input.id}`, { method: "PUT", body: JSON.stringify(input) });
  }
  return fetchApi("/blogs", { method: "POST", body: JSON.stringify(input) });
}

export async function setBlogStatus(id: string, status: Blog["status"], reason?: string) {
  const action = status === "published" ? "approve" : "reject";
  const body = action === "reject" ? JSON.stringify({ reason }) : undefined;
  return fetchApi(`/blogs/${id}/${action}`, { method: "PATCH", body });
}

export async function getDashboard() {
  const stats = await fetchApi("/admin/stats");
  // The frontend needs a specific structure
  return {
    totalUsers: stats.totalUsers,
    newSignups7d: 0,
    newSignups30d: 0,
    activeCourses: stats.totalCourses,
    pendingApprovals: 0,
    openListings: 0,
    monthEnrollments: 0,
    enrollmentTrend: [],
    topCourses: [],
    leaderboard: [],
  };
}

export interface ApprovalItem {
  id: string;
  type: "Course" | "Blog" | "Training";
  title: string;
  submittedBy: string;
  submittedOn: string;
  preview: string;
}

export async function listApprovals(): Promise<ApprovalItem[]> {
  const courses = await fetchApi("/admin/courses");
  const trainings = await fetchApi("/admin/trainings");
  const blogs = await fetchApi("/blogs");
  
  const c: ApprovalItem[] = courses
    .filter((x: any) => x.status === "pending_approval")
    .map((x: any) => ({
      id: x._id,
      type: "Course",
      title: x.title,
      submittedBy: x.createdBy,
      submittedOn: x.updatedAt,
      preview: x.description,
    }));
    
  const t: ApprovalItem[] = trainings
    .filter((x: any) => x.status === "pending_approval")
    .map((x: any) => ({
      id: x._id,
      type: "Training",
      title: x.title,
      submittedBy: x.createdBy,
      submittedOn: x.updatedAt,
      preview: x.description,
    }));
    
  const b: ApprovalItem[] = blogs
    .filter((x: any) => x.status === "pending_approval")
    .map((x: any) => ({
      id: x._id,
      type: "Blog",
      title: x.title,
      submittedBy: x.author,
      submittedOn: x.updatedAt,
      preview: x.excerpt,
    }));
    
  return [...c, ...t, ...b].sort((a, z) => (a.submittedOn < z.submittedOn ? 1 : -1));
}
