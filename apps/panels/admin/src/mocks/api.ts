import type { Blog, Course, PanelUser, Internship, Career, Product, Order } from "@/lib/types";
import { getAuthToken } from "@/lib/session";

const API_URL = "http://localhost:5000/api";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.statusText}`);
  }
  return res.json();
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(): Promise<PanelUser[]> {
  const data = await fetchApi("/admin/users");
  return data.map((u: any) => ({
    id: u._id || u.id,
    name: u.fullName || u.email?.split("@")[0] || "User",
    email: u.email || `${u.referralCode || "user"}@enginow.com`,
    role: (u.roles && u.roles.includes("admin")) ? "Admin" : (u.roles && u.roles.includes("hr")) ? "HR" : "Learner",
    referralCode: u.referralCode || "N/A",
    referralsMade: u.referralUsageCount || 0,
    joined: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "2026-01-01",
    active: !u.referralExpired,
    courses: u.courses || [],
    applications: u.applications || [],
    certificates: u.certificates || [],
    referralActivity: u.referralActivity || [],
    orders: u.orders || [],
    avatarUrl: u.avatarUrl,
    collegeName: u.collegeName,
  }));
}

export async function setUserActive(id: string, active: boolean) {
  return { id, active } as any;
}

export async function updateUser(id: string, patch: Partial<PanelUser>) {
  return { id, ...patch } as any;
}

export async function regenerateReferralCode(id: string) {
  return "NEWCODE" + Math.floor(Math.random() * 1000);
}

// ─── Courses & Trainings ──────────────────────────────────────────────────────

export async function listCourses(): Promise<Course[]> {
  const [courses, trainings] = await Promise.all([
    fetchApi("/admin/courses").catch(() => []),
    fetchApi("/admin/trainings").catch(() => []),
  ]);

  const mappedCourses: Course[] = courses.map((c: any) => ({
    id: c._id || c.id,
    title: c.title || "",
    kind: "course",
    category: c.category || "Development",
    pricing: c.isFree ? "Free" : "Premium",
    badges: [
      c.isNew && "New",
      c.isPopular && "Popular",
      c.isComingSoon && "Coming Soon",
      c.isPremium && "Premium",
    ].filter(Boolean) as string[],
    status: (c.status === "published" ? "live" : c.status) || "live",
    enrollments: c.enrollments || (c.learners?.length ?? 0),
    description: c.description || c.shortDescription || "",
    bannerUrl: c.bannerUrl,
    videos: (c.roadmap || []).map((m: any) => ({ url: m.videoUrl || "", notes: m.notes || m.title || "" })),
    roadmap: c.roadmap || [],
    createdBy: c.createdBy || "Admin",
    createdByRole: "admin",
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    learners: c.learners || [],
    rejectionReason: c.rejectionReason,
  }));

  const mappedTrainings: Course[] = trainings.map((t: any) => ({
    id: t._id || t.id,
    title: t.title || "",
    kind: "training",
    category: t.category || "Bootcamp",
    pricing: "Premium",
    badges: ["Training", ...(t.youWillLearn || [])],
    status: (t.status === "published" ? "live" : t.status) || "live",
    enrollments: t.enrollments || (t.learners?.length ?? 0),
    description: t.description || t.shortDescription || (t.youWillLearn ? `Learn: ${t.youWillLearn.join(", ")}` : ""),
    bannerUrl: t.bannerUrl,
    videos: (t.roadmap || []).map((m: any) => ({ url: m.videoUrl || "", notes: m.notes || m.title || "" })),
    roadmap: t.roadmap || [],
    youWillLearn: t.youWillLearn || [],
    createdBy: t.createdBy || "Admin",
    createdByRole: "admin",
    updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    learners: t.learners || [],
    rejectionReason: t.rejectionReason,
  }));

  return [...mappedCourses, ...mappedTrainings];
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
  const options: RequestInit = { method: "PATCH" };
  if (action === "reject" && reason) {
    options.body = JSON.stringify({ reason });
  }
  return fetchApi(`/admin/courses/${id}/${action}`, options);
}

// ─── Blogs ────────────────────────────────────────────────────────────────────

export async function listBlogs(): Promise<Blog[]> {
  const data = await fetchApi("/blogs").catch(() => []);
  return data.map((b: any) => ({
    id: b._id || b.id,
    title: b.title || "",
    excerpt: b.excerpt || b.description || "",
    body: b.body || b.content || "",
    author: b.author || "Admin",
    authorRole: "admin",
    status: b.status === "published" ? "live" : b.status || "live",
    created: b.createdAt ? new Date(b.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    updated: b.updatedAt ? new Date(b.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    likes: b.likes || 0,
    shares: b.shares || 0,
    saves: b.saves || 0,
    bannerUrl: b.bannerUrl || b.imageUrl,
    rejectionReason: b.rejectionReason,
  }));
}

export async function saveBlog(input: Partial<Blog> & { id?: string }): Promise<Blog> {
  if (input.id) {
    return fetchApi(`/blogs/${input.id}`, { method: "PUT", body: JSON.stringify(input) });
  }
  return fetchApi("/blogs", { method: "POST", body: JSON.stringify(input) });
}

export async function setBlogStatus(id: string, status: Blog["status"], reason?: string) {
  const action = status === "live" || status === "published" ? "approve" : "reject";
  const options: RequestInit = { method: "PATCH" };
  if (action === "reject" && reason) {
    options.body = JSON.stringify({ reason });
  }
  return fetchApi(`/blogs/${id}/${action}`, options);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard() {
  const [stats, users, courses, trainings, internships, careers] = await Promise.all([
    fetchApi("/admin/stats").catch(() => ({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0 })),
    fetchApi("/admin/users").catch(() => []),
    fetchApi("/admin/courses").catch(() => []),
    fetchApi("/admin/trainings").catch(() => []),
    fetchApi("/admin/internships").catch(() => []),
    fetchApi("/admin/careers").catch(() => []),
  ]);

  const topCourses = [...courses, ...trainings].map((c: any) => ({
    title: c.title || "Course",
    enrollments: c.enrollments || 1,
  }));

  const leaderboard = users
    .filter((u: any) => u.referralCode)
    .map((u: any) => ({
      name: u.fullName || u.email?.split("@")[0] || "Learner",
      code: u.referralCode,
      referrals: u.referralUsageCount || 0,
    }))
    .sort((a: any, b: any) => b.referrals - a.referrals)
    .slice(0, 10);

  return {
    totalUsers: stats.totalUsers || users.length || 0,
    newSignups7d: users.length > 0 ? users.length : 0,
    newSignups30d: users.length > 0 ? users.length : 0,
    activeCourses: (courses.length + trainings.length) || stats.totalCourses || 0,
    pendingApprovals: 0,
    openListings: internships.length + careers.length,
    monthEnrollments: stats.totalEnrollments || 0,
    enrollmentTrend: [
      { month: "Jan", enrollments: 0 },
      { month: "Feb", enrollments: 0 },
      { month: "Mar", enrollments: 0 },
      { month: "Apr", enrollments: 0 },
      { month: "May", enrollments: 0 },
      { month: "Jun", enrollments: 1 },
      { month: "Jul", enrollments: stats.totalEnrollments || 2 },
      { month: "Aug", enrollments: stats.totalEnrollments || 2 },
    ],
    topCourses: topCourses.length > 0 ? topCourses : [{ title: "General", enrollments: 0 }],
    leaderboard,
  };
}

// ─── Approvals ────────────────────────────────────────────────────────────────

export interface ApprovalItem {
  id: string;
  type: "Course" | "Blog" | "Training" | "Internship" | "Career";
  title: string;
  submittedBy: string;
  submittedOn: string;
  preview: string;
}

export async function listApprovals(): Promise<ApprovalItem[]> {
  const [courses, trainings, blogs] = await Promise.all([
    fetchApi("/admin/courses").catch(() => []),
    fetchApi("/admin/trainings").catch(() => []),
    fetchApi("/blogs").catch(() => []),
  ]);
  
  const c: ApprovalItem[] = courses
    .filter((x: any) => x.status === "pending_approval")
    .map((x: any) => ({
      id: x._id || x.id,
      type: "Course",
      title: x.title,
      submittedBy: x.createdBy || "Educator",
      submittedOn: x.updatedAt || new Date().toISOString(),
      preview: x.description || "",
    }));
    
  const t: ApprovalItem[] = trainings
    .filter((x: any) => x.status === "pending_approval")
    .map((x: any) => ({
      id: x._id || x.id,
      type: "Training",
      title: x.title,
      submittedBy: x.createdBy || "Educator",
      submittedOn: x.updatedAt || new Date().toISOString(),
      preview: x.description || "",
    }));
    
  const b: ApprovalItem[] = blogs
    .filter((x: any) => x.status === "pending_approval")
    .map((x: any) => ({
      id: x._id || x.id,
      type: "Blog",
      title: x.title,
      submittedBy: x.author || "User",
      submittedOn: x.updatedAt || new Date().toISOString(),
      preview: x.excerpt || x.description || "",
    }));
    
  return [...c, ...t, ...b].sort((a, z) => (a.submittedOn < z.submittedOn ? 1 : -1));
}

// ─── Internships ──────────────────────────────────────────────────────────────

export async function listInternships(): Promise<Internship[]> {
  const data = await fetchApi("/admin/internships").catch(() => []);
  return data.map((i: any) => ({
    id: i._id || i.id,
    title: i.title || "",
    company: i.company || "Enginow",
    location: i.locationType || i.location || "Remote",
    type: i.type || "Summer",
    domain: i.domain || "",
    stipend: i.stipend || "Unpaid",
    duration: i.duration || "2 Months",
    description: i.description || "",
    responsibilities: i.responsibilities || "",
    requirements: Array.isArray(i.requirements) ? i.requirements : (i.tags ? [i.tags] : []),
    perks: Array.isArray(i.perks) ? i.perks : [],
    tags: i.tags || "",
    status: (i.status === "published" || i.isOpen ? "live" : i.status) || "live",
    isOpen: i.isOpen ?? true,
    applicantsCount: i.applicantsCount || 0,
    openFrom: i.openFrom ? new Date(i.openFrom).toISOString().split("T")[0] : "",
    openUntil: i.openUntil ? new Date(i.openUntil).toISOString().split("T")[0] : "",
    createdAt: i.createdAt || new Date().toISOString(),
    updatedAt: i.updatedAt || new Date().toISOString(),
  }));
}

export async function saveInternship(input: Partial<Internship> & { id?: string }): Promise<Internship> {
  if (input.id) {
    return fetchApi(`/admin/internships/${input.id}`, { method: "PUT", body: JSON.stringify(input) });
  }
  return fetchApi("/admin/internships", { method: "POST", body: JSON.stringify(input) });
}

export async function deleteInternship(id: string) {
  return fetchApi(`/admin/internships/${id}`, { method: "DELETE" });
}

// ─── Careers ──────────────────────────────────────────────────────────────────

export async function listCareers(): Promise<Career[]> {
  const data = await fetchApi("/admin/careers").catch(() => []);
  return data.map((c: any) => ({
    id: c._id || c.id,
    title: c.title || "",
    company: c.company || "Enginow",
    location: c.locationType || c.location || "Onsite",
    type: c.type || "Full-time",
    domain: c.domain || "",
    salary: c.salary || "Competitive",
    description: c.description || "",
    responsibilities: c.responsibilities || "",
    requirements: Array.isArray(c.requirements) ? c.requirements : [],
    perks: Array.isArray(c.perks) ? c.perks : [],
    tags: c.tags || "",
    status: (c.status === "published" || c.isOpen ? "live" : c.status) || "live",
    isOpen: c.isOpen ?? true,
    applicantsCount: c.applicantsCount || 0,
    openFrom: c.openFrom ? new Date(c.openFrom).toISOString().split("T")[0] : "",
    openUntil: c.openUntil ? new Date(c.openUntil).toISOString().split("T")[0] : "",
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  }));
}

export async function saveCareer(input: Partial<Career> & { id?: string }): Promise<Career> {
  if (input.id) {
    return fetchApi(`/admin/careers/${input.id}`, { method: "PUT", body: JSON.stringify(input) });
  }
  return fetchApi("/admin/careers", { method: "POST", body: JSON.stringify(input) });
}

export async function deleteCareer(id: string) {
  return fetchApi(`/admin/careers/${id}`, { method: "DELETE" });
}

// ─── Shop / Products ──────────────────────────────────────────────────────────

export async function listProducts(): Promise<Product[]> {
  const data = await fetchApi("/admin/products").catch(() => []);
  return data.map((p: any) => ({
    id: p._id || p.id,
    name: p.name || "",
    slug: p.slug,
    shortDescription: p.shortDescription || "",
    description: p.description || p.shortDescription || "",
    price: p.price || 0,
    discountedPrice: p.discountedPrice || 0,
    category: p.category || "Merchandise",
    imageUrl: p.imageUrl || (p.images && p.images[0]) || "",
    images: p.images || [],
    rating: p.rating || 5,
    stock: p.stock ?? 100,
    status: p.status === "published" || p.status === "active" ? "active" : "inactive",
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt,
  }));
}

export async function saveProduct(input: Partial<Product> & { id?: string }): Promise<Product> {
  if (input.id) {
    return fetchApi(`/admin/products/${input.id}`, { method: "PUT", body: JSON.stringify(input) });
  }
  return fetchApi("/admin/products", { method: "POST", body: JSON.stringify(input) });
}

export async function deleteProduct(id: string) {
  return fetchApi(`/admin/products/${id}`, { method: "DELETE" });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function listOrders(): Promise<Order[]> {
  const data = await fetchApi("/admin/orders").catch(() => []);
  return data.map((o: any) => ({
    id: o._id || o.id,
    userId: o.userId || "",
    userName: o.userFullName || "Customer",
    userFullName: o.userFullName || "Customer",
    userEmail: o.userEmail || "",
    productId: o.productId || "",
    productName: o.productName || "Enginow Merchandise",
    productImage: o.productImage || "",
    items: [{
      productId: o.productId || "",
      name: o.productName || "Enginow Merchandise",
      qty: 1,
      price: o.amount || 0,
    }],
    amount: o.amount || 0,
    total: o.amount || 0,
    status: o.status || "pending",
    trackingId: o.trackingId || "",
    trackingSite: o.trackingSite || "",
    address: o.address,
    customization: o.customization,
    createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "",
  }));
}

export async function updateOrderTracking(id: string, trackingId: string, status: Order["status"], trackingSite?: string) {
  return fetchApi(`/admin/orders/${id}/tracking`, {
    method: "PUT",
    body: JSON.stringify({ trackingId, status, trackingSite })
  });
}

// ─── INTERNSHIP APPLICATIONS ──────────────────────────────────────────────────

export interface Application {
  id: string;
  internshipId?: string;
  internshipTitle?: string;
  internshipDomain?: string;
  careerId?: string;
  careerTitle?: string;
  careerDomain?: string;
  status: "pending" | "shortlisted" | "oa" | "interview" | "selected" | "rejected" | "oa-cleared" | "oa-failed";
  assessmentId?: string;
  hasCompletedOA?: boolean;
  userId?: string;
  appliedAt: string;
  fullName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  cityState?: string;
  experience?: string;
  education?: string;
  college?: string;
  graduationYear?: string;
  semester?: string;
  cgpa?: string;
  skills?: string;
  availability?: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export async function listInternshipApplications(internshipId?: string): Promise<Application[]> {
  const qs = internshipId ? `?internshipId=${internshipId}` : "";
  return fetchApi(`/admin/internship-applications${qs}`);
}

export async function updateInternshipApplicationStatus(id: string, status: string, assessmentId?: string) {
  return fetchApi(`/admin/internship-applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...(assessmentId ? { assessmentId } : {}) }),
  });
}

export async function issueCertificate(applicationId: string, type: string, customDocumentBase64?: string) {
  return fetchApi(`/admin/internship-applications/${applicationId}/certificate`, {
    method: "POST",
    body: JSON.stringify({ type, customDocumentBase64 }),
  });
}

export async function getIssuedCertificates(applicationId: string) {
  return fetchApi(`/admin/internship-applications/${applicationId}/certificates`);
}

// ─── CAREER APPLICATIONS ──────────────────────────────────────────────────────

export async function listCareerApplications(careerId?: string): Promise<Application[]> {
  const qs = careerId ? `?careerId=${careerId}` : "";
  return fetchApi(`/admin/career-applications${qs}`);
}

export async function updateCareerApplicationStatus(appId: string, status: string, assessmentId?: string, extra?: { interviewDate?: string, interviewLink?: string }) {
  return fetchApi(`/admin/career-applications/${appId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, assessmentId, ...extra }),
  });
}

export async function getOAResultAnalysis(assessmentId: string, userId: string) {
  return fetchApi(`/assessments/${assessmentId}/results/${userId}`);
}

// ─── Assessments ──────────────────────────────────────────────────────────────

export interface AssessmentQuestion {
  id?: string;
  text: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0–3
}

export interface AssessmentModule {
  id?: string;
  title: string;
  timeLimitSeconds: number;
  questions: AssessmentQuestion[];
}

export interface Assessment {
  id?: string;
  title: string;
  description?: string;
  listingId: string;
  listingType: "internship" | "career";
  modules: AssessmentModule[];
  createdAt?: string;
}

export async function listAssessments(): Promise<Assessment[]> {
  return fetchApi("/assessments").catch(() => []);
}

export async function getAssessmentForEdit(id: string): Promise<Assessment> {
  return fetchApi(`/assessments/${id}/edit`);
}

export async function saveAssessment(data: Assessment): Promise<{ id: string }> {
  if (data.id) {
    return fetchApi(`/assessments/${data.id}`, { method: "PUT", body: JSON.stringify(data) });
  }
  return fetchApi("/assessments", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteAssessment(id: string) {
  return fetchApi(`/assessments/${id}`, { method: "DELETE" });
}

export async function getAssessmentResults(id: string) {
  return fetchApi(`/assessments/${id}/results`).catch(() => []);
}
