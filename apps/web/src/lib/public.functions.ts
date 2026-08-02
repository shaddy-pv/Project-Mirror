export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface PlatformStats {
  users: number;
  courses: number;
  enrollments: number;
}

export interface LatestCohort {
  id: string;
  title: string;
  slug: string;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const res = await fetch(`${API_URL}/public/stats`);
  if (!res.ok) throw new Error("Failed to fetch platform stats");
  return res.json();
}

export async function getLatestCohort(): Promise<LatestCohort | null> {
  const res = await fetch(`${API_URL}/public/latest-cohort`);
  if (!res.ok) throw new Error("Failed to fetch latest cohort");
  return res.json();
}
