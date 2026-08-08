import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api").replace("localhost", "127.0.0.1") + "/blogs";

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

export const getBlogs = async () => {
  const res = await fetch(API_URL);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Network error");
  return data;
};

export const getBlogById = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Network error");
  return data;
};

export const submitBlog = async ({ data }: { data: Record<string, unknown> }) => {
  return fetchWithAuth("/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
