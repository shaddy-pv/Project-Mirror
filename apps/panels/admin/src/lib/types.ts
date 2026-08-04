export type Role = "admin" | "educator" | "hr" | "sales";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  educator: "Educator",
  hr: "HR",
  sales: "Sales",
};

export type WorkStatus = "draft" | "pending" | "live" | "rejected" | "archived" | "published" | "active" | "inactive";

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
  role: "Admin" | "HR" | "Learner" | "Intern" | "Applicant" | string;
  referralCode: string;
  referralsMade: number;
  joined: string;
  active: boolean;
  courses: string[];
  applications: string[];
  certificates: string[];
  referralActivity: { code?: string; sharedOn?: string; joinedName: string; joinedOn: string; resource?: string }[];
  orders?: string[];
  avatarUrl?: string;
  collegeName?: string;
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
  roadmap: any[];
  youWillLearn?: string[];
  createdBy: string;
  createdByRole: Role;
  updatedAt: string;
  learners: { id?: string; name: string; email: string; enrolledOn: string; progress?: number }[];
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

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  domain?: string;
  stipend?: string;
  duration: string;
  description: string;
  responsibilities?: string;
  requirements: string[];
  perks?: string[];
  tags?: string;
  status: WorkStatus;
  isOpen?: boolean;
  applicantsCount?: number;
  openFrom?: string;
  openUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Career {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  domain?: string;
  salary?: string;
  description: string;
  responsibilities?: string;
  requirements: string[];
  perks?: string[];
  tags?: string;
  status: WorkStatus;
  isOpen?: boolean;
  applicantsCount?: number;
  openFrom?: string;
  openUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  stock?: number;
  status: "active" | "inactive" | "published" | "draft";
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  userFullName?: string;
  userEmail?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  items?: { productId: string; name: string; qty: number; price: number }[];
  amount?: number;
  total: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  trackingSite?: string;
  createdAt: string;
  updatedAt?: string;
  address?: {
    state: string;
    city: string;
    pincode: string;
    landmark?: string;
    fullAddress: string;
  };
  customization?: {
    quotes?: string;
    coverImageUrl?: string;
    backSideName?: string;
  };
}
