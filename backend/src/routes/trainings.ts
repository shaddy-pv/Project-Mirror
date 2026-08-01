import { Router } from "express";
import { trainings, enrollments, profiles, referrals, ensureUserProfile } from "../collections";
import { cacheGet, cacheSet } from "../utils/cache";
import { ObjectId } from "mongodb";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const CACHE_KEY = "trainings:published";
const CACHE_TTL = 120; // 2 minutes

// @ts-ignore
router.get("/", async (req, res) => {
  try {
    const cached = await cacheGet<unknown[]>(CACHE_KEY);
    if (cached) {
      return res.json(cached);
    }

    const docs = await trainings().find({ status: "published" }).sort({ createdAt: -1 }).toArray();
    
    const formattedDocs = docs.map((d) => {
      const { _id, ...rest } = d;
      return { ...rest, id: _id.toString() };
    });

    await cacheSet(CACHE_KEY, formattedDocs, CACHE_TTL);
    res.json(formattedDocs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/:slug", async (req, res) => {
  try {
    let query: any = { slug: req.params.slug, status: "published" };
    if (req.params.slug.length === 24) {
      query = { $or: [{ slug: req.params.slug }, { _id: new ObjectId(req.params.slug) }], status: "published" };
    }
    const doc = await trainings().findOne(query);
    if (!doc) {
      return res.status(404).json({ error: "Training not found" });
    }
    const { _id, roadmap, ...rest } = doc;
    res.json({
      ...rest,
      id: _id.toString(),
      roadmap: roadmap || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/enroll", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { trainingId, referralCode } = req.body;
    const { userId, claims } = req.user!;

    await ensureUserProfile(userId, { fullName: claims.name, avatarUrl: claims.picture });

    const trainingObjectId = new ObjectId(trainingId);
    const existing = await enrollments().findOne({ userId, trainingId: trainingObjectId });
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
          resourceType: "training",
          resourceId: trainingId,
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
      trainingId: trainingObjectId,
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

export default router;
