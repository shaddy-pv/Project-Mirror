import { session } from "./role";
import type { Blog, Course, Learner, Profile, Resource } from "./mock/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const rawAuth = typeof window !== "undefined" ? localStorage.getItem("enginow_educator_auth") : null;
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

export const uid = () => Math.random().toString(36).slice(2, 9);

export const api = {
  async listCourses(kind?: Course["kind"]) {
    const [courses, trainings] = await Promise.all([
      fetchApi("/admin/courses"),
      fetchApi("/admin/trainings")
    ]);
    const mappedCourses = courses.map((c: any) => ({ ...c, kind: "course" }));
    const mappedTrainings = trainings.map((t: any) => ({ ...t, kind: "training" }));
    return [...mappedCourses, ...mappedTrainings];
  },
  async getCourse(id: string) {
    return fetchApi(`/admin/courses/${id}`);
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
    if (!courseId) return [];
    const courses = await this.listCourses();
    const course = courses.find((c: any) => c.id === courseId);
    return course?.learners || [];
  },
  async getDashboard() {
    return fetchApi("/admin/educator/dashboard");
  },

  async listBlogs() {
    return fetchApi("/admin/blogs");
  },
  async getBlog(id: string) {
    return fetchApi(`/admin/blogs/${id}`);
  },
  async saveBlog(input: any) {
    if (input.id) {
      return fetchApi(`/admin/blogs/${input.id}`, { method: "PUT", body: JSON.stringify(input) });
    }
    return fetchApi("/admin/blogs", { method: "POST", body: JSON.stringify(input) });
  },
  async deleteBlog(id: string) {
    // not implemented backend route for DELETE /admin/blogs/:id
    // But educator shouldn't delete easily anyway without route, let's leave as is
    return fetchApi(`/admin/blogs/${id}`, { method: "DELETE" });
  },

  async listResources() {
    return fetchApi("/admin/resources");
  },
  async saveResource(input: any) {
    if (input.id) {
      return fetchApi(`/admin/resources/${input.id}`, { method: "PUT", body: JSON.stringify(input) });
    }
    return fetchApi("/admin/resources", { method: "POST", body: JSON.stringify(input) });
  },
  async deleteResource(id: string) {
    return fetchApi(`/admin/resources/${id}`, { method: "DELETE" });
  },

  async getProfile(): Promise<any> {
    const res = await fetchApi("/staff/me");
    return res.staff;
  },
  async saveProfile(input: Partial<Profile>) {
    const res = await fetchApi("/staff/me", { method: "PATCH", body: JSON.stringify(input) });
    return res.staff;
  },
};

export type { Blog, Course, Learner, Profile, Resource };
