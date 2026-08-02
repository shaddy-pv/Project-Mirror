export type Role = "admin" | "educator" | "hr" | "sales";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  educator: "Educator",
  hr: "HR",
  sales: "Sales",
};

export type WorkStatus = "draft" | "pending" | "live" | "rejected" | "archived";

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface PanelUser {
  id: string;
  name: string;
  email: string;
  role: "Learner" | "Intern" | "Applicant";
  referralCode: string;
  referralsMade: number;
  joined: string;
  active: boolean;
  courses: string[];
  applications: string[];
  certificates: string[];
  referralActivity: { code: string; sharedOn: string; joinedName: string; joinedOn: string }[];
}

export interface Course {
  id: string;
  title: string;
  kind: "course" | "training";
  category: string;
  pricing: "Free" | "Premium";
  badges: string[];
  status: WorkStatus;
  enrollments: number;
  description: string;
  bannerUrl?: string | undefined;
  videos: { url: string; notes: string }[];
  roadmap: string[];
  createdBy: string;
  createdByRole: Role;
  updatedAt: string;
  learners: { name: string; email: string; enrolledOn: string }[];
  rejectionReason?: string | undefined;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  authorRole: Role;
  status: WorkStatus;
  created: string;
  updated: string;
  likes: number;
  shares: number;
  saves: number;
  bannerUrl?: string | undefined;
  rejectionReason?: string | undefined;
}

export interface EnrollmentPoint {
  month: string;
  enrollments: number;
}
