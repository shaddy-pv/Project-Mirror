import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/courses";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (firebaseAuth.currentUser) {
    const token = await firebaseAuth.currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Network error");
  return data;
}

export const listPublishedCourses = async () => {
  return fetchWithAuth("/published");
};

export const getCourseBySlug = async ({ data }: { data: { slug: string } }) => {
  return fetchWithAuth(`/slug/${data.slug}`);
};

export const validateReferralCode = async ({ data }: { data: { code: string } }) => {
  return fetchWithAuth(`/referral/validate?code=${data.code}`);
};

export const enrollInCourse = async ({ data }: { data: { courseId: string; referralCode?: string } }) => {
  return fetchWithAuth("/enroll", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const createRazorpayOrder = async ({ data }: { data: { amount: number } }) => {
  return fetchWithAuth("/razorpay/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const verifyRazorpayPayment = async ({ data }: { data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string } }) => {
  return fetchWithAuth("/razorpay/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getMyEnrollments = async () => {
  if (!firebaseAuth.currentUser) return [];
  return fetchWithAuth("/my-enrollments");
};

export const updateEnrollmentProgress = async ({ data }: { data: { courseId: string; progress: number } }) => {
  return fetchWithAuth("/enrollments/progress", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getMyProfile = async () => {
  if (!firebaseAuth.currentUser) return null;
  return fetchWithAuth("/my-profile");
};
