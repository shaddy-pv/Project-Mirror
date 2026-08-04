import { ObjectId } from "mongodb";
import { getDb } from "./db";

// ─── Document Types ───────────────────────────────────────────────────────────

export type StaffRole = "admin" | "hr" | "educator" | "sales";

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

export interface StaffAccountDoc {
  _id: ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  role: StaffRole;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  status: "draft" | "pending_approval" | "live" | "archived" | "published" | "active";
  rejectionReason?: string;
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
  status: "draft" | "pending_approval" | "live" | "archived" | "published" | "active";
  rejectionReason?: string;
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
export const staffAccounts = () => getDb().collection<StaffAccountDoc>("staff_accounts");
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
  
  const setOnUpdate: any = {
    updatedAt: now,
  };

  if (profileData?.fullName) setOnUpdate.fullName = profileData.fullName;
  if (profileData?.avatarUrl) setOnUpdate.avatarUrl = profileData.avatarUrl;
  if (profileData?.collegeName) setOnUpdate.collegeName = profileData.collegeName;
  if (profileData?.course) setOnUpdate.course = profileData.course;
  if (profileData?.specialization) setOnUpdate.specialization = profileData.specialization;

  let retries = 5;
  while (retries > 0) {
    try {
      const setOnInsert: any = {
        _id: uid,
        referralCode: generateReferralCode(),
        createdAt: now,
      };

      await profiles().updateOne(
        { _id: uid },
        {
          $setOnInsert: setOnInsert,
          $set: setOnUpdate,
        },
        { upsert: true },
      );
      break; // Success!
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.referralCode) {
        retries--;
        if (retries === 0) throw new Error("Failed to generate a unique referral code after multiple attempts.");
      } else {
        throw error;
      }
    }
  }
}

function generateReferralCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const assessments = () => getDb().collection<any>('assessments');
export const inquiries = () => getDb().collection<any>('inquiries');
