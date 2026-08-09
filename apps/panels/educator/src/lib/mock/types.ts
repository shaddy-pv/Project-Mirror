export type Status = "draft" | "pending" | "live" | "rejected" | "archived";
export type BlogStatus = "draft" | "pending" | "published" | "rejected";

export type Category = "AI" | "Development" | "Data Science" | "Electronics" | "Core Engineering";
export type PricingType = "free" | "premium";
export type CourseBadge = "new" | "popular";

export interface VideoLink {
  id: string;
  url: string;
  notes: string;
}

export interface Module {
  id: string;
  title: string;
}

export interface Course {
  id: string;
  kind: "course" | "training";
  title: string;
  description: string;
  category: Category;
  pricing: PricingType;
  duration?: string;
  badges: CourseBadge[];
  bannerUrl?: string | undefined;
  videos: VideoLink[];
  modules: Module[];
  status: Status;
  rejectionReason?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface Learner {
  id: string;
  name: string;
  email: string;
  courseId: string;
  enrolledAt: string;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  bannerUrl?: string | undefined;
  body: string;
  status: BlogStatus;
  rejectionReason?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  tag: string;
  fileName: string;
  createdAt: string;
  downloads: number;
}

export interface Profile {
  name: string;
  email: string;
  notifyApprovals: boolean;
  notifyEnrollments: boolean;
  notifyWeeklySummary: boolean;
}
