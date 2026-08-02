import { session } from "./role";
import type { Blog, Course, Learner, Profile, Resource } from "./mock/types";

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
  async listCourses(kind?: Course["kind"]) {
    // Educator gets their own courses or all courses depending on API design,
    // actually backend `GET /admin/courses` returns all for admin, educator gets theirs.
    return fetchApi("/admin/courses");
  },
  async getCourse(id: string) {
    // We don't have a specific GET /admin/courses/:id in the backend, but we have GET /courses/:id
    return fetchApi(`/courses/${id}`);
  },
  async saveCourse(input: any) {
    if (input.id) {
      return fetchApi(`/admin/courses/${input.id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      });
    }
    // API uses /admin/courses for creation if kind === 'course' and /admin/trainings for training
    if (input.kind === "training") {
      return fetchApi("/admin/trainings", { method: "POST", body: JSON.stringify(input) });
    }
    return fetchApi("/admin/courses", { method: "POST", body: JSON.stringify(input) });
  },
  async archiveCourse(id: string) {
    return fetchApi(`/admin/courses/${id}`, { method: "DELETE" }); // Mapping archive to delete or status update
  },
  async deleteCourse(id: string) {
    return fetchApi(`/admin/courses/${id}`, { method: "DELETE" });
  },
  async listLearners(courseId?: string) {
    // Not implemented in backend fully, but let's assume /admin/enrollments
    return []; 
  },
  async enrollmentCounts() {
    return fetchApi("/admin/stats").then(s => ({ "all": s.totalEnrollments })).catch(() => ({}));
  },

  async listBlogs() {
    return fetchApi("/blogs");
  },
  async getBlog(id: string) {
    return fetchApi(`/blogs/${id}`);
  },
  async saveBlog(input: any) {
    if (input.id) {
      return fetchApi(`/blogs/${input.id}`, { method: "PUT", body: JSON.stringify(input) });
    }
    return fetchApi("/blogs", { method: "POST", body: JSON.stringify(input) });
  },
  async deleteBlog(id: string) {
    return fetchApi(`/blogs/${id}`, { method: "DELETE" });
  },

  async listResources() {
    return []; // Not implemented in backend yet
  },
  async saveResource(input: any) {
    return {};
  },
  async deleteResource(id: string) {},

  async getProfile(): Promise<Profile> {
    return { name: "Educator", email: "educator@enginow.com", notifyApprovals: true, notifyEnrollments: true, notifyWeeklySummary: true };
  },
  async saveProfile(input: Partial<Profile>) {
    return this.getProfile();
  },
};

export type { Blog, Course, Learner, Profile, Resource };
