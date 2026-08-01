import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/careers";

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

export const getCareers = async () => {
  // Public route, no auth strictly required
  const res = await fetch(API_URL);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Network error");
  return data;
};

export const applyForCareer = async ({ data }: { data: any & { careerId: string } }) => {
  const { careerId, ...rest } = data;
  return fetchWithAuth(`/${careerId}/apply`, {
    method: "POST",
    body: JSON.stringify(rest),
  });
};

export const getMyCareerApplications = async () => {
  return fetchWithAuth("/my-applications");
};
