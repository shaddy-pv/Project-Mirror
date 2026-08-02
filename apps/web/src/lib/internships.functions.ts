import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/internships";

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

export const getInternships = async () => {
  // Public route, no auth strictly required, but fetchWithAuth attaches if logged in
  const res = await fetch(API_URL);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Network error");
  return data;
};

export const applyForInternship = async ({ data }: { data: Record<string, unknown> & { internshipId: string } }) => {
  const { internshipId, ...rest } = data;
  return fetchWithAuth(`/${internshipId}/apply`, {
    method: "POST",
    body: JSON.stringify(rest),
  });
};

export const getMyInternshipApplications = async () => {
  return fetchWithAuth("/my-applications");
};
