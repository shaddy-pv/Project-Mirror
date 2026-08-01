import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/users";

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

export const completeUserProfile = async ({ data }: { data: any }) => {
  return fetchWithAuth("/complete-profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
