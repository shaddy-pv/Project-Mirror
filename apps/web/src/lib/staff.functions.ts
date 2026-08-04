import { getStaffToken, StaffRole } from "./staffAuth";

const BASE_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function staffFetch(portal: StaffRole, endpoint: string, options: RequestInit = {}) {
  const token = getStaffToken(portal);
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${BASE_API}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Staff request failed");
    return data;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}`);
  }
  return res.text();
}

// ─── Stats & Users ────────────────────────────────────────────────────────────

export const staffGetStats = (portal: StaffRole) => staffFetch(portal, "/admin/stats");
export const staffGetUsers = (portal: StaffRole) => staffFetch(portal, "/admin/users");

// ─── Courses ──────────────────────────────────────────────────────────────────

export const staffGetCourses = (portal: StaffRole) => staffFetch(portal, "/admin/courses");
export const staffCreateCourse = (portal: StaffRole, data: any) =>
  staffFetch(portal, "/admin/courses", { method: "POST", body: JSON.stringify(data) });
export const staffUpdateCourse = (portal: StaffRole, id: string, data: any) =>
  staffFetch(portal, `/admin/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const staffApproveCourse = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/admin/courses/${id}/approve`, { method: "PATCH" });
export const staffRejectCourse = (portal: StaffRole, id: string, reason: string) =>
  staffFetch(portal, `/admin/courses/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
export const staffDeleteCourse = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/admin/courses/${id}`, { method: "DELETE" });

// ─── Trainings ────────────────────────────────────────────────────────────────

export const staffGetTrainings = (portal: StaffRole) => staffFetch(portal, "/admin/trainings");
export const staffCreateTraining = (portal: StaffRole, data: any) =>
  staffFetch(portal, "/admin/trainings", { method: "POST", body: JSON.stringify(data) });
export const staffUpdateTraining = (portal: StaffRole, id: string, data: any) =>
  staffFetch(portal, `/admin/trainings/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const staffApproveTraining = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/admin/trainings/${id}/approve`, { method: "PATCH" });
export const staffRejectTraining = (portal: StaffRole, id: string, reason: string) =>
  staffFetch(portal, `/admin/trainings/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
export const staffDeleteTraining = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/admin/trainings/${id}`, { method: "DELETE" });

// ─── Internships ─────────────────────────────────────────────────────────────

export const staffGetInternships = (portal: StaffRole) => staffFetch(portal, "/admin/internships");
export const staffCreateInternship = (portal: StaffRole, data: any) =>
  staffFetch(portal, "/admin/internships", { method: "POST", body: JSON.stringify(data) });
export const staffUpdateInternship = (portal: StaffRole, id: string, data: any) =>
  staffFetch(portal, `/admin/internships/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const staffApproveInternship = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/admin/internships/${id}/approve`, { method: "PATCH" });
export const staffRejectInternship = (portal: StaffRole, id: string, reason: string) =>
  staffFetch(portal, `/admin/internships/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
export const staffDeleteInternship = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/admin/internships/${id}`, { method: "DELETE" });

// ─── Careers ─────────────────────────────────────────────────────────────────

export const staffGetCareers = (portal: StaffRole) => staffFetch(portal, "/admin/careers");
export const staffCreateCareer = (portal: StaffRole, data: any) =>
  staffFetch(portal, "/admin/careers", { method: "POST", body: JSON.stringify(data) });
export const staffUpdateCareer = (portal: StaffRole, id: string, data: any) =>
  staffFetch(portal, `/admin/careers/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const staffApproveCareer = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/admin/careers/${id}/approve`, { method: "PATCH" });
export const staffRejectCareer = (portal: StaffRole, id: string, reason: string) =>
  staffFetch(portal, `/admin/careers/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
export const staffDeleteCareer = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/admin/careers/${id}`, { method: "DELETE" });

// ─── Applications & Candidates ───────────────────────────────────────────────

export const staffGetInternshipApps = (portal: StaffRole, internshipId?: string) =>
  staffFetch(portal, `/admin/internship-applications${internshipId ? `?internshipId=${internshipId}` : ""}`);
export const staffUpdateInternshipAppStatus = (portal: StaffRole, id: string, status: string) =>
  staffFetch(portal, `/admin/internship-applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const staffIssueCertificate = (portal: StaffRole, applicationId: string, certData: any) =>
  staffFetch(portal, `/admin/internship-applications/${applicationId}/certificate`, { method: "POST", body: JSON.stringify(certData) });

export const staffGetCareerApps = (portal: StaffRole) => staffFetch(portal, "/admin/career-applications");
export const staffUpdateCareerAppStatus = (portal: StaffRole, id: string, status: string) =>
  staffFetch(portal, `/admin/career-applications/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });

// ─── Shop & Orders ───────────────────────────────────────────────────────────

export const staffGetProducts = (portal: StaffRole) => staffFetch(portal, "/admin/products");
export const staffCreateProduct = (portal: StaffRole, data: any) =>
  staffFetch(portal, "/admin/products", { method: "POST", body: JSON.stringify(data) });
export const staffUpdateProduct = (portal: StaffRole, id: string, data: any) =>
  staffFetch(portal, `/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const staffDeleteProduct = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/admin/products/${id}`, { method: "DELETE" });

export const staffGetOrders = (portal: StaffRole) => staffFetch(portal, "/admin/orders");
export const staffUpdateOrderTracking = (portal: StaffRole, id: string, data: { trackingId?: string; trackingSite?: string; status?: string }) =>
  staffFetch(portal, `/admin/orders/${id}/tracking`, { method: "PUT", body: JSON.stringify(data) });

// ─── Inquiries & Sales Analytics ─────────────────────────────────────────────

export const staffGetInquiries = (portal: StaffRole, category?: string) =>
  staffFetch(portal, `/inquiries${category ? `?category=${category}` : ""}`);
export const staffUpdateInquiryStatus = (portal: StaffRole, id: string, status: string) =>
  staffFetch(portal, `/inquiries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const staffGetSalesDashboard = (portal: StaffRole) => staffFetch(portal, "/sales/dashboard");

// ─── Assessments ─────────────────────────────────────────────────────────────

export const staffCreateAssessment = (portal: StaffRole, data: any) =>
  staffFetch(portal, "/assessments", { method: "POST", body: JSON.stringify(data) });
export const staffGetAssessmentResults = (portal: StaffRole, id: string) =>
  staffFetch(portal, `/assessments/${id}/results`);
