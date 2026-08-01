import { Router } from "express";
import { getDb } from "../db";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { ObjectId } from "mongodb";
import { sendApplicationEmail } from "../utils/mailer";
import { cacheGet, cacheSet } from "../utils/cache";

const router = Router();
const CACHE_KEY = "careers:all";
const CACHE_TTL = 120; // 2 minutes

// Get all careers with dynamically calculated `isOpen` state
// @ts-ignore
router.get("/", async (req, res) => {
  try {
    const cached = await cacheGet<unknown[]>(CACHE_KEY);
    if (cached) {
      return res.json(cached);
    }

    const docs = await getDb().collection("careers").find({}).sort({ createdAt: -1 }).toArray();
    const now = new Date();

    const formattedDocs = docs.map((d) => {
      const { _id, ...rest } = d;
      const openFrom = new Date(rest.openFrom);
      const openUntil = new Date(rest.openUntil);
      const isOpen = now >= openFrom && now <= openUntil;
      return { ...rest, id: _id.toString(), isOpen };
    });

    await cacheSet(CACHE_KEY, formattedDocs, CACHE_TTL);
    res.json(formattedDocs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/my-applications", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const apps = await getDb().collection("career_applications").find({ userId }).sort({ appliedAt: -1 }).toArray();

    const enriched = await Promise.all(apps.map(async (app) => {
      const career = await getDb().collection("careers").findOne({ _id: app.careerId });

      const { _id, ...rest } = app;
      return {
        ...rest,
        id: _id.toString(),
        careerId: app.careerId.toString(),
        career: career ? {
          id: career._id.toString(),
          title: career.title,
          domain: career.domain,
          locationType: career.locationType,
          perks: career.perks ?? [],
        } : null,
      };
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Apply for a career
// @ts-ignore
router.post("/:id/apply", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { resumeUrl, coverLetter } = req.body;
    const userId = req.user!.userId;
    const now = new Date();
    const careerIdStr = String(req.params.id);

    const career = await getDb().collection("careers").findOne({ _id: new ObjectId(careerIdStr) });
    if (!career) {
      return res.status(404).json({ error: "Career not found" });
    }

    const openFrom = new Date(career.openFrom);
    const openUntil = new Date(career.openUntil);
    const isOpen = now >= openFrom && now <= openUntil;

    if (!isOpen) {
      return res.status(400).json({ error: "This career position is not currently accepting applications." });
    }

    const existingApplication = await getDb().collection("career_applications").findOne({
      careerId: new ObjectId(careerIdStr),
      userId,
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied for this position." });
    }

    const payload = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      linkedin: req.body.linkedin,
      github: req.body.github,
      cityState: req.body.cityState,
      experience: req.body.experience,
      education: req.body.education,
      college: req.body.college,
      graduationYear: req.body.graduationYear,
      semester: req.body.semester,
      cgpa: req.body.cgpa,
      skills: req.body.skills,
      availability: req.body.availability,
      resumeUrl: req.body.resumeUrl,
      coverLetter: req.body.coverLetter,
    };

    await getDb().collection("career_applications").insertOne({
      _id: new ObjectId(),
      careerId: new ObjectId(careerIdStr),
      userId,
      ...payload,
      status: "pending",
      appliedAt: now,
    });

    // Send email asynchronously
    sendApplicationEmail(payload, career).catch(console.error);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
