import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/careers";

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

const FALLBACK_CAREERS = [
  {
    _id: "career-1",
    id: "career-1",
    title: "Senior ML Systems Engineer",
    company: "Enginow Research Lab",
    location: "Bengaluru · Remote Optional",
    type: "Full-time",
    experience: "3+ years",
    salary: "₹24L – ₹38L",
    status: "open",
    description: "Design low-latency model inference runtimes, distributed training pipelines, and custom CUDA kernels.",
    requirements: ["Deep expertise in PyTorch / C++", "Experience with GPU performance profiling", "Strong systems fundamentals"],
  },
  {
    _id: "career-2",
    id: "career-2",
    title: "Founding Product Engineer (Full-Stack)",
    company: "Enginow Core Platform",
    location: "Remote",
    type: "Full-time",
    experience: "2+ years",
    salary: "₹18L – ₹30L",
    status: "open",
    description: "Build delightful, interactive engineering learning environments, code sandboxes, and collaboration tools.",
    requirements: ["Expertise in Next.js, React, TypeScript", "Eye for typography, animations and design craft", "PostgreSQL / MongoDB proficiency"],
  },
  {
    _id: "career-3",
    id: "career-3",
    title: "Curriculum Engineer · Systems & Rust",
    company: "Enginow Academy",
    location: "Remote",
    type: "Full-time",
    experience: "2+ years",
    salary: "₹16L – ₹28L",
    status: "open",
    description: "Author deep, runnable curriculum on distributed systems, operating systems, and kernel programming.",
    requirements: ["Strong Rust & Systems programming skills", "Passion for high-clarity technical writing", "Experience mentoring or reviewing code"],
  },
];

export const getCareers = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Network error");
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_CAREERS;
  } catch {
    return FALLBACK_CAREERS;
  }
};

export const applyForCareer = async ({ data }: { data: Record<string, unknown> & { careerId: string } }) => {
  const { careerId, ...rest } = data;
  return fetchWithAuth(`/${careerId}/apply`, {
    method: "POST",
    body: JSON.stringify(rest),
  });
};

export const getMyCareerApplications = async () => {
  return fetchWithAuth("/my-applications");
};
