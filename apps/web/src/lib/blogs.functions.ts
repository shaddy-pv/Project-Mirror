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

const FALLBACK_BLOGS = [
  {
    _id: "blog-1",
    id: "blog-1",
    title: "Understanding Transformer Attention Mechanisms from Scratch",
    slug: "transformer-attention-from-scratch",
    author: "Enginow Research",
    createdAt: new Date().toISOString(),
    content: "An intuitive mathematical and visual walkthrough of Scaled Dot-Product Attention, Multi-Head Attention, and causal masking.",
    category: "AI & Machine Learning",
    tags: ["Deep Learning", "Transformers", "NLP"],
  },
  {
    _id: "blog-2",
    id: "blog-2",
    title: "Zero-Allocation Parsing in High-Performance Rust Systems",
    slug: "zero-allocation-parsing-rust",
    author: "Systems Collective",
    createdAt: new Date().toISOString(),
    content: "Techniques for zero-copy deserialization with Serde, byte-slice slicing, and arena allocators in high-throughput network daemons.",
    category: "Systems Engineering",
    tags: ["Rust", "Performance", "Networking"],
  },
];

export const getBlogs = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Network error");
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_BLOGS;
  } catch {
    return FALLBACK_BLOGS;
  }
};

export const getBlogById = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Network error");
    return data;
  } catch {
    const match = FALLBACK_BLOGS.find((b) => b._id === id || b.slug === id);
    if (match) return match;
    return FALLBACK_BLOGS[0];
  }
};

export const submitBlog = async ({ data }: { data: Record<string, unknown> }) => {
  return fetchWithAuth("/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
