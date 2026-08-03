import { Router } from "express";
import { profiles, courses, enrollments, trainings } from "../collections";
import { cacheGet, cacheSet } from "../utils/cache";

const router = Router();

// Cache keys
const STATS_CACHE_KEY = "public:stats";
const COHORT_CACHE_KEY = "public:latest_cohort";
const TTL = 120; // 2 minutes

router.get("/stats", async (req, res) => {
  try {
    const cached = await cacheGet(STATS_CACHE_KEY);
    if (cached) return res.json(cached);

    const [usersCount, coursesCount, enrollmentsCount] = await Promise.all([
      profiles().countDocuments(),
      courses().countDocuments({ status: { $in: ["live", "published"] } }),
      enrollments().countDocuments(),
    ]);

    const stats = {
      users: usersCount,
      courses: coursesCount,
      enrollments: enrollmentsCount,
    };

    await cacheSet(STATS_CACHE_KEY, stats, TTL);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/latest-cohort", async (req, res) => {
  try {
    const cached = await cacheGet(COHORT_CACHE_KEY);
    if (cached) return res.json(cached);

    const latestTraining = await trainings()
      .find({ status: { $in: ["live", "published"] } })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    let result = null;
    if (latestTraining.length > 0) {
      const doc = latestTraining[0];
      result = {
        id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug,
      };
    }

    await cacheSet(COHORT_CACHE_KEY, result, TTL);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
