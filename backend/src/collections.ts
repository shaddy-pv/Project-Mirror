import { ObjectId } from "mongodb";
import { getDb } from "./db";

// ─── Document Types ───────────────────────────────────────────────────────────

export type AppRole = "learner" | "educator" | "hr" | "sales" | "admin";

export interface ProfileDoc {
  _id: string; // Firebase uid
  fullName?: string;
  avatarUrl?: string;
  collegeName?: string;
  course?: string;
  specialization?: string;
  referralCode?: string;
  referralUsageCount?: number;
  referralExpired?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleDoc {
  _id: ObjectId;
  userId: string; // Firebase uid
  role: AppRole;
}

export interface CourseModule {
  title: string;
  description?: string;
  notes?: string;
  videoUrl?: string; // YouTube link
  imageUrl?: string;
  documentUrl?: string;
}

export interface CourseDoc {
  _id: ObjectId;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  bannerUrl?: string;
  category: string;
  level: string;
  duration?: string;
  price: number;
  isFree: boolean;
  isPremium: boolean;
  isNew: boolean;
  isPopular: boolean;
  isComingSoon: boolean;
  roadmap: CourseModule[];
  createdBy?: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingDoc {
  _id: ObjectId;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: string;
  youWillLearn: string[]; // e.g. ["React", "Next.js"]
  roadmap: CourseModule[];
  originalPrice: number;
  discountedPrice: number;
  bannerUrl?: string;
  createdBy?: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentDoc {
  _id: ObjectId;
  userId: string; // Firebase uid
  courseId?: ObjectId;
  trainingId?: ObjectId;
  enrolledAt: Date;
  progress: number;
  referralCode?: string;
  discountApplied?: number;
}

export interface ReferralDoc {
  _id: ObjectId;
  referralCode: string;
  referrerId: string;
  referredUserId: string;
  resourceType: "course" | "training" | "product";
  resourceId: string;
  usedAt: Date;
  discountApplied: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paid?: boolean;
}

export interface ProductDoc {
  _id: ObjectId;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  price: number;
  discountedPrice: number;
  images: string[];
  rating: number;
  category: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDoc {
  _id: ObjectId;
  userId: string;
  productId: ObjectId;
  amount: number;
  referralCode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  trackingSite?: string;
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
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}


// ─── Collection Accessors ────────────────────────────────────────────────────

export const profiles = () => getDb().collection<ProfileDoc>("profiles");
export const userRoles = () => getDb().collection<UserRoleDoc>("user_roles");
export const courses = () => getDb().collection<CourseDoc>("courses");
export const trainings = () => getDb().collection<TrainingDoc>("trainings");
export const enrollments = () => getDb().collection<EnrollmentDoc>("course_enrollments");
export const referrals = () => getDb().collection<ReferralDoc>("referrals");
export const products = () => getDb().collection<ProductDoc>("products");
export const orders = () => getDb().collection<OrderDoc>("shop_orders");

// ─── Helpers ─────────────────────────────────────────────────────────────────

export async function ensureUserProfile(uid: string, profileData?: {
  fullName?: string;
  avatarUrl?: string;
  collegeName?: string;
  course?: string;
  specialization?: string;
}) {
  const now = new Date();
  
  const setOnInsert: any = {
    _id: uid,
    referralCode: generateReferralCode(),
    createdAt: now,
  };

  const setOnUpdate: any = {
    updatedAt: now,
  };

  if (profileData?.fullName) setOnUpdate.fullName = profileData.fullName;
  if (profileData?.avatarUrl) setOnUpdate.avatarUrl = profileData.avatarUrl;
  if (profileData?.collegeName) setOnUpdate.collegeName = profileData.collegeName;
  if (profileData?.course) setOnUpdate.course = profileData.course;
  if (profileData?.specialization) setOnUpdate.specialization = profileData.specialization;

  await profiles().updateOne(
    { _id: uid },
    {
      $setOnInsert: setOnInsert,
      $set: setOnUpdate,
    },
    { upsert: true },
  );
  
  await userRoles().updateOne(
    { userId: uid, role: "learner" },
    { $setOnInsert: { userId: uid, role: "learner" } },
    { upsert: true },
  );
}

function generateReferralCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
