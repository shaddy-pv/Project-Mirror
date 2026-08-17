const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/practice";

const FALLBACK_PRACTICE = [
  {
    id: "dsa-fundamentals",
    title: "Data Structures & Algorithms Diagnostic",
    subject: "Computer Science Core",
    description: "Assess arrays, trees, dynamic programming, graph traversal and asymptotic complexity.",
    questionsCount: 25,
    timeLimitMinutes: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: "system-design-quiz",
    title: "Distributed Systems & System Architecture",
    subject: "Systems Engineering",
    description: "Test concepts on caching, load balancing, consensus algorithms (Raft/Paxos), and sharding.",
    questionsCount: 20,
    timeLimitMinutes: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: "js-ts-internals",
    title: "JavaScript Engine & TypeScript Type Systems",
    subject: "Web Technologies",
    description: "Deep dive into event loop mechanics, V8 optimizations, ASTs, and advanced generics.",
    questionsCount: 30,
    timeLimitMinutes: 40,
    createdAt: new Date().toISOString(),
  },
];

export const getPracticeTests = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Network error");
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_PRACTICE;
  } catch {
    return FALLBACK_PRACTICE;
  }
};
