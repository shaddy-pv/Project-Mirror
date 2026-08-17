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

const FALLBACK_COURSES = [
  {
    id: "applied-ml",
    title: "Applied Machine Learning & Neural Networks",
    slug: "applied-ml",
    category: "AI & Machine Learning",
    description: "Build neural networks from scratch. Backprop, convolutions, transformers, and deployment on GPU clusters.",
    modules: [
      { title: "Linear Models & Gradient Descent", duration: "2h" },
      { title: "Backpropagation & Autograd", duration: "3h" },
      { title: "Convolutional Networks", duration: "3h" },
      { title: "Transformers & Attention", duration: "4h" },
      { title: "Model Optimization & Inference", duration: "3h" },
    ],
    duration: "18h",
    level: "Intermediate",
    discountedPrice: 0,
    price: 0,
    status: "published",
  },
  {
    id: "distributed-systems",
    title: "Distributed Systems & Consensus in Rust",
    slug: "distributed-systems",
    category: "Systems Engineering",
    description: "Master Raft, Paxos, distributed storage, and asynchronous networking with Rust.",
    modules: [
      { title: "Raft Consensus Algorithm", duration: "4h" },
      { title: "gRPC & Network Protocols", duration: "3h" },
      { title: "Distributed KV Store", duration: "5h" },
      { title: "Fault Tolerance & Partitioning", duration: "4h" },
    ],
    duration: "24h",
    level: "Advanced",
    discountedPrice: 4999,
    price: 7999,
    status: "published",
  },
  {
    id: "compilers-llvm",
    title: "Compilers, ASTs & LLVM Code Generation",
    slug: "compilers-llvm",
    category: "Compilers",
    description: "Write lexers, parsers, typecheckers, and target LLVM IR for a custom compiled language.",
    modules: [
      { title: "Lexical & Syntactic Analysis", duration: "3h" },
      { title: "Abstract Syntax Trees & Typechecking", duration: "4h" },
      { title: "LLVM IR Generation", duration: "5h" },
      { title: "Optimizations & JIT Compilation", duration: "4h" },
    ],
    duration: "16h",
    level: "Advanced",
    discountedPrice: 3499,
    price: 5999,
    status: "published",
  },
  {
    id: "cloud-architecture",
    title: "Modern Full-Stack Architecture & Cloud",
    slug: "cloud-architecture",
    category: "Cloud & Web",
    description: "Design microservices, event-driven architectures, edge computing, and real-time streaming.",
    modules: [
      { title: "Microservices Architecture", duration: "4h" },
      { title: "Event Streaming with Kafka", duration: "4h" },
      { title: "Serverless & Edge Compute", duration: "4h" },
    ],
    duration: "20h",
    level: "All levels",
    discountedPrice: 0,
    price: 0,
    status: "published",
  },
];

export const listPublishedCourses = async () => {
  try {
    const data = await fetchWithAuth("/published");
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_COURSES;
  } catch {
    return FALLBACK_COURSES;
  }
};

export const getCourseBySlug = async ({ data }: { data: { slug: string } }) => {
  try {
    return await fetchWithAuth(`/slug/${data.slug}`);
  } catch {
    const match = FALLBACK_COURSES.find((c) => c.slug === data.slug || c.id === data.slug);
    if (match) return match;
    return FALLBACK_COURSES[0];
  }
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
