import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/admin";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (firebaseAuth.currentUser) {
    const token = await firebaseAuth.currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Network error");
    return data;
  } else {
    const text = await res.text();
    if (!res.ok) throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}`);
    return text;
  }
}

export interface UserRoleInfo {
  role: "learner" | "educator" | "hr" | "sales" | "admin";
  isStaff: boolean;
  isAdmin: boolean;
  isHr: boolean;
  isEducator: boolean;
  isSales: boolean;
}

export const getUserRole = async (): Promise<UserRoleInfo> => {
  if (!firebaseAuth.currentUser) {
    return {
      role: "learner",
      isStaff: false,
      isAdmin: false,
      isHr: false,
      isEducator: false,
      isSales: false,
    };
  }
  return fetchWithAuth("/my-role");
};

export const isUserAdmin = async () => {
  if (!firebaseAuth.currentUser) return false;
  return fetchWithAuth("/is-admin");
};

export const adminListUsers = async () => {
  return fetchWithAuth("/users");
};

export const adminListCourses = async () => {
  return fetchWithAuth("/courses");
};

export const adminCreateCourse = async ({ data }: { data: Record<string, unknown> }) => {
  return fetchWithAuth("/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const adminGetCourse = async (id: string) => {
  return fetchWithAuth(`/courses/${id}`);
};

export const adminUpdateCourse = async ({ data }: { data: Record<string, unknown> & { id: string } }) => {
  const { id, ...rest } = data;
  return fetchWithAuth(`/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
};

export const adminDeleteCourse = async ({ data }: { data: { id: string } }) => {
  return fetchWithAuth(`/courses/${data.id}`, {
    method: "DELETE",
  });
};

export const adminListInternships = async () => {
  return fetchWithAuth("/internships");
};

export const adminCreateInternship = async ({ data }: { data: Record<string, unknown> }) => {
  return fetchWithAuth("/internships", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const adminGetInternship = async (id: string) => {
  return fetchWithAuth(`/internships/${id}`);
};

export const adminUpdateInternship = async ({ data }: { data: Record<string, unknown> & { id: string } }) => {
  const { id, ...rest } = data;
  return fetchWithAuth(`/internships/${id}`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
};

export const adminDeleteInternship = async ({ data }: { data: { id: string } }) => {
  return fetchWithAuth(`/internships/${data.id}`, {
    method: "DELETE",
  });
};

export const adminGetStats = async () => {
  return fetchWithAuth("/stats");
};

export const makeAdmin = async ({ data }: { data: { secretKey: string } }) => {
  return fetchWithAuth("/make-admin", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const adminSetUserRole = async ({ data }: { data: { targetUserId: string; role: string } }) => {
  return fetchWithAuth("/set-role", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const adminListApplications = async (internshipId?: string) => {
  const qs = internshipId ? `?internshipId=${internshipId}` : "";
  return fetchWithAuth(`/internship-applications${qs}`);
};

export const adminIssueCertificate = async ({ data }: { data: { applicationId: string; type: string; customDocumentBase64?: string } }) => {
  return fetchWithAuth(`/internship-applications/${data.applicationId}/certificate`, {
    method: "POST",
    body: JSON.stringify({ type: data.type, customDocumentBase64: data.customDocumentBase64 }),
  });
};

export const adminGetCertificates = async (applicationId: string) => {
  return fetchWithAuth(`/internship-applications/${applicationId}/certificates`);
};

export const adminUpdateApplicationStatus = async ({ data }: { data: { id: string; status: string } }) => {
  return fetchWithAuth(`/internship-applications/${data.id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: data.status }),
  });
};

export const adminListTrainings = async () => {
  return fetchWithAuth("/trainings");
};

export const adminGetTraining = async (id: string) => {
  return fetchWithAuth(`/trainings/${id}`);
};

export const adminCreateTraining = async ({ data }: { data: Record<string, unknown> }) => {
  return fetchWithAuth("/trainings", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const adminUpdateTraining = async ({ data }: { data: Record<string, unknown> & { id: string } }) => {
  const { id, ...rest } = data;
  return fetchWithAuth(`/trainings/${id}`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
};

export const adminDeleteTraining = async (id: string) => {
  return fetchWithAuth(`/trainings/${id}`, {
    method: "DELETE",
  });
};

export const adminListCareers = async () => {
  return fetchWithAuth("/careers");
};

export const adminGetCareer = async (id: string) => {
  return fetchWithAuth(`/careers/${id}`);
};

export const adminCreateCareer = async ({ data }: { data: Record<string, unknown> }) => {
  return fetchWithAuth("/careers", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const adminUpdateCareer = async ({ data }: { data: Record<string, unknown> & { id: string } }) => {
  const { id, ...rest } = data;
  return fetchWithAuth(`/careers/${id}`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
};

export const adminDeleteCareer = async ({ data }: { data: { id: string } }) => {
  return fetchWithAuth(`/careers/${data.id}`, {
    method: "DELETE",
  });
};

export const adminListCareerApplications = async () => {
  return fetchWithAuth("/career-applications");
};

export const adminUpdateCareerApplicationStatus = async ({ data }: { data: { id: string; status: string } }) => {
  return fetchWithAuth(`/career-applications/${data.id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: data.status }),
  });
};

// ─── SHOP PRODUCTS ───────────────────────────────────────────────────────────

export const adminListProducts = async () => {
  return fetchWithAuth("/products");
};

export const adminCreateProduct = async ({ data }: { data: Record<string, unknown> }) => {
  return fetchWithAuth("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const adminUpdateProduct = async ({ data }: { data: Record<string, unknown> & { id: string } }) => {
  const { id, ...rest } = data;
  return fetchWithAuth(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
};

export const adminDeleteProduct = async ({ data }: { data: { id: string } }) => {
  return fetchWithAuth(`/products/${data.id}`, {
    method: "DELETE",
  });
};

export const adminListOrders = async () => {
  return fetchWithAuth("/orders");
};

export const adminUpdateOrderTracking = async ({ data }: { data: { id: string; trackingId?: string; trackingSite?: string; status?: string } }) => {
  const { id, ...rest } = data;
  return fetchWithAuth(`/orders/${id}/tracking`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
};
