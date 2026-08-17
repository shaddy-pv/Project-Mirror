import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api").replace("localhost", "127.0.0.1") + "/internships";

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

const FALLBACK_INTERNSHIPS = [
  {
    _id: "intern-1",
    id: "intern-1",
    title: "Product Design & Frontend Engineering Intern",
    domain: "Design & Web",
    locationType: "Remote",
    type: "Summer",
    duration: "3 Months",
    stipend: "₹25,000 / month",
    status: "open",
    isOpen: true,
    description: "Work with senior engineers and designers on world-class design systems, responsive web apps, and interactive component libraries.",
    responsibilities: "Build accessible React components, contribute to design system tokens, ship real features for thousands of active developers.",
    perks: ["1-on-1 mentorship with staff engineers", "Flexible hours", "Pre-placement offer (PPO) opportunities"],
    tags: "React, Next.js, Figma, TypeScript",
  },
  {
    _id: "intern-2",
    id: "intern-2",
    title: "Data Science & Applied ML Intern",
    domain: "Machine Learning",
    locationType: "Hybrid (Bengaluru)",
    type: "Monsoon",
    duration: "2 Months",
    stipend: "₹30,000 / month",
    status: "open",
    isOpen: true,
    description: "Develop ML pipeline prototypes, train small vision/language models, and run benchmarking experiments on GPU clusters.",
    responsibilities: "Data preprocessing, fine-tuning open-source models, writing clean benchmark reports.",
    perks: ["Access to H100 GPU compute clusters", "Co-authoring technical case studies", "Competitive stipend"],
    tags: "Python, PyTorch, HuggingFace, CUDA",
  },
  {
    _id: "intern-3",
    id: "intern-3",
    title: "Systems Software & Rust Intern",
    domain: "Systems Engineering",
    locationType: "Remote",
    type: "Winter",
    duration: "2 Months",
    stipend: "₹28,000 / month",
    status: "open",
    isOpen: true,
    description: "Implement high-throughput network parsers, async protocols, and memory-safe system utilities in Rust.",
    responsibilities: "Write asynchronous Rust services using Tokio, profile memory allocations, create unit & integration test suites.",
    perks: ["Deep systems engineering mentorship", "Open-source contributions", "Certificate of excellence"],
    tags: "Rust, Tokio, WebAssembly, Linux",
  },
];

export const getInternships = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Network error");
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_INTERNSHIPS;
  } catch {
    return FALLBACK_INTERNSHIPS;
  }
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
