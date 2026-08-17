import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const FALLBACK_TRAININGS = [
  {
    id: "mern-bootcamp",
    slug: "mern-bootcamp",
    title: "MERN Stack Full-Stack Cohort",
    category: "Full-Stack Web Development",
    originalPrice: 20000,
    discountedPrice: 15000,
    youWillLearn: ["React 19 & Next.js App Router", "Node.js, Express & Microservices", "MongoDB & Redis Caching", "Docker, CI/CD & Cloud Deployment"],
    status: "live",
  },
  {
    id: "data-science-pro",
    slug: "data-science-pro",
    title: "Data Science & Machine Learning Immersion",
    category: "AI & Data Science",
    originalPrice: 23000,
    discountedPrice: 18000,
    youWillLearn: ["Python, NumPy & Pandas", "Statistical Modeling & Hypothesis Testing", "Deep Learning with PyTorch", "Production MLOps on AWS"],
    status: "live",
  },
  {
    id: "cloud-architect",
    slug: "cloud-architect",
    title: "Cloud Architect Masterclass (AWS & Kubernetes)",
    category: "Cloud Engineering",
    originalPrice: 25000,
    discountedPrice: 20000,
    youWillLearn: ["AWS Solutions Architecture", "Kubernetes Orchestration & Helm", "Infrastructure as Code (Terraform)", "Zero Trust Security & Monitoring"],
    status: "live",
  },
];

export const listPublishedTrainings = async () => {
  try {
    const res = await fetch(`${API_URL}/trainings`);
    if (!res.ok) throw new Error("Failed to fetch trainings");
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_TRAININGS;
  } catch {
    return FALLBACK_TRAININGS;
  }
};

export const getTrainingBySlug = async ({ data }: { data: { slug: string } }) => {
  try {
    const res = await fetch(`${API_URL}/trainings/${data.slug}`);
    if (!res.ok) throw new Error("Failed to fetch training");
    return await res.json();
  } catch {
    const match = FALLBACK_TRAININGS.find((t) => t.slug === data.slug || t.id === data.slug);
    if (match) return match;
    return FALLBACK_TRAININGS[0];
  }
};

export const enrollInTraining = async ({ data }: { data: { trainingId: string; referralCode?: string } }) => {
  const token = await firebaseAuth.currentUser?.getIdToken();
  const res = await fetch(`${API_URL}/trainings/enroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to enroll in training");
  }
  return res.json();
};
