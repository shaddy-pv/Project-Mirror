import { Router } from "express";
import { ObjectId } from "mongodb";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { courses, enrollments, ensureUserProfile, profiles, referrals } from "../collections";
import crypto from "node:crypto";
import { cacheGet, cacheSet, cacheDel } from "../utils/cache";

const router = Router();
const COURSES_CACHE_KEY = "courses:published";
const CACHE_TTL = 120; // 2 minutes

const getRazorpay = async () => {
  const Razorpay = (await import("razorpay")).default;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
};

router.get("/published", async (req, res) => {
  try {
    const cached = await cacheGet<unknown[]>(COURSES_CACHE_KEY);
    if (cached) return res.json(cached);

    const docs = await courses().find({ status: "live" }).sort({ createdAt: -1 }).toArray();
    const result = docs.map((c) => ({
      id: c._id.toString(),
      slug: c.slug,
      title: c.title,
      shortDescription: c.shortDescription ?? null,
      description: c.description ?? null,
      bannerUrl: c.bannerUrl ?? null,
      category: c.category,
      level: c.level,
      duration: c.duration ?? null,
      price: c.price,
      isFree: c.isFree,
      isPremium: c.isPremium,
      isNew: c.isNew,
      isPopular: c.isPopular,
      isComingSoon: c.isComingSoon,
      roadmap: c.roadmap,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    }));

    await cacheSet(COURSES_CACHE_KEY, result, CACHE_TTL);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await courses().findOne({ slug, status: "live" });
    if (!course) return res.status(404).json({ error: "Course not found" });

    res.json({
      id: course._id.toString(),
      slug: course.slug,
      title: course.title,
      shortDescription: course.shortDescription ?? null,
      description: course.description ?? null,
      bannerUrl: course.bannerUrl ?? null,
      category: course.category,
      level: course.level,
      duration: course.duration ?? null,
      price: course.price,
      isFree: course.isFree,
      isPremium: course.isPremium,
      isNew: course.isNew,
      isPopular: course.isPopular,
      isComingSoon: course.isComingSoon,
      roadmap: course.roadmap,
      status: course.status,
      createdAt: course.createdAt.toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/referral/validate", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") return res.status(400).json({ error: "Invalid code" });

    const owner = await profiles().findOne({ referralCode: code });
    if (!owner) return res.json({ valid: false, reason: "not_found" });
    if (owner.referralExpired) return res.json({ valid: false, reason: "expired" });

    res.json({
      valid: true,
      referrerId: owner._id,
      discountPercent: 15,
      usesLeft: 5 - (owner.referralUsageCount ?? 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/enrollment-stats", async (req, res) => {
  try {
    const id = String(req.params.id);
    const count = await enrollments().countDocuments({ courseId: new ObjectId(id) });
    res.json({ enrollments: count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/enroll", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { courseId, referralCode } = req.body;
    const { userId, claims } = req.user!;

    await ensureUserProfile(userId, { fullName: claims.name, avatarUrl: claims.picture });

    const courseObjectId = new ObjectId(courseId);
    const existing = await enrollments().findOne({ userId, courseId: courseObjectId });
    if (existing) {
      return res.json({ enrolled: true, enrollmentId: existing._id.toString(), discountApplied: 0 });
    }

    let discountApplied = 0;
    let referrerId: string | null = null;

    if (referralCode) {
      const owner = await profiles().findOne({ referralCode });
      if (owner && !owner.referralExpired && owner._id.toString() !== userId) {
        discountApplied = 15;
        referrerId = owner._id.toString();

        await referrals().insertOne({
          _id: new ObjectId(),
          referralCode,
          referrerId: owner._id,
          referredUserId: userId,
          resourceType: "course",
          resourceId: courseId,
          usedAt: new Date(),
          discountApplied: 15,
          paid: false,
        });

        const newCount = (owner.referralUsageCount ?? 0) + 1;
        await profiles().updateOne(
          { _id: owner._id },
          { $set: { referralUsageCount: newCount, referralExpired: newCount >= 5, updatedAt: new Date() } }
        );
      }
    }

    const result = await enrollments().insertOne({
      _id: new ObjectId(),
      userId,
      courseId: courseObjectId,
      enrolledAt: new Date(),
      progress: 0,
      ...(referralCode && { referralCode }),
      ...(discountApplied > 0 && { discountApplied }),
    });

    res.json({ enrolled: true, enrollmentId: result.insertedId.toString(), discountApplied, referrerId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/razorpay/create", requireFirebaseAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    const razorpay = await getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
    });
    res.json({ id: order.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/razorpay/verify", requireFirebaseAuth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");
    res.json({ valid: generatedSignature === razorpaySignature });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/my-enrollments", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.user!;
    const myEnrollments = await enrollments().find({ userId }).sort({ enrolledAt: -1 }).toArray();

    if (myEnrollments.length === 0) return res.json([]);

    const courseIds = myEnrollments.map((e) => e.courseId).filter((id): id is ObjectId => !!id);
    const courseDocs = await courses().find({ _id: { $in: courseIds } }).toArray();
    const courseMap = new Map(courseDocs.map((c) => [c._id.toString(), c]));

    res.json(myEnrollments.map((e) => {
      const courseIdStr = e.courseId ? e.courseId.toString() : "";
      const course = courseMap.get(courseIdStr);
      return {
        id: e._id.toString(),
        userId: e.userId,
        courseId: courseIdStr,
        enrolledAt: e.enrolledAt.toISOString(),
        progress: e.progress,
        courses: course ? {
          id: course._id.toString(),
          slug: course.slug,
          title: course.title,
          level: course.level,
          duration: course.duration ?? null,
          bannerUrl: course.bannerUrl ?? null,
        } : null,
      };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/enrollments/progress", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { courseId, progress } = req.body;
    const { userId } = req.user!;
    const courseObjectId = new ObjectId(courseId);

    const result = await enrollments().updateOne(
      { userId, courseId: courseObjectId },
      { $set: { progress } }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: "Enrollment not found" });
    res.json({ success: true, progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/my-profile", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.user!;
    const profile = await profiles().findOne({ _id: userId });
    if (!profile) return res.json(null);
    res.json({
      referralCode: profile.referralCode ?? null,
      referralUsageCount: profile.referralUsageCount ?? 0,
      referralExpired: profile.referralExpired ?? false,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
