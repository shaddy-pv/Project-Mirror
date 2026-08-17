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
  try {
    const res = await fetch(`${API_URL}/public/stats`);
    if (!res.ok) throw new Error("Failed to fetch platform stats");
    return await res.json();
  } catch {
    return {
      users: 12400,
      courses: 28,
      enrollments: 45200,
    };
  }
}

export async function getLatestCohort(): Promise<LatestCohort | null> {
  try {
    const res = await fetch(`${API_URL}/public/latest-cohort`);
    if (!res.ok) throw new Error("Failed to fetch latest cohort");
    return await res.json();
  } catch {
    return {
      id: "cohort-winter",
      title: "Systems & ML Engineering Cohort",
      slug: "systems-ml-cohort",
    };
  }
}
