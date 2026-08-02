import { Router } from "express";
import { getDb } from "../db";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { ObjectId } from "mongodb";
import { sendApplicationEmail } from "../utils/mailer";
import { cacheGet, cacheSet } from "../utils/cache";

const router = Router();
const CACHE_KEY = "internships:all";
const CACHE_TTL = 120; // 2 minutes

// Get all internships with dynamically calculated `isOpen` state
// @ts-ignore
router.get("/", async (req, res) => {
  try {
    // Cache-aside: serve from Redis if available
    const cached = await cacheGet<unknown[]>(CACHE_KEY);
    if (cached) {
      return res.json(cached);
    }

    const docs = await getDb().collection("internships").find({ status: { $nin: ["draft", "pending_approval"] } }).sort({ createdAt: -1 }).toArray();
    const now = new Date();

    const formattedDocs = docs.map((d) => {
      const { _id, ...rest } = d;
      const openFrom = new Date(rest.openFrom);
      const openUntil = new Date(rest.openUntil);
      const isOpen = now >= openFrom && now <= openUntil;
      
      let computedStatus = rest.status || "open";
      if (computedStatus === "open" && now > openUntil) {
        computedStatus = "expired";
      }

      return { ...rest, id: _id.toString(), isOpen, status: computedStatus };
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
    const apps = await getDb().collection("internship_applications").find({ userId }).sort({ appliedAt: -1 }).toArray();

    // Enrich with internship details + certificates
    const enriched = await Promise.all(apps.map(async (app) => {
      const [internship, certificates] = await Promise.all([
        getDb().collection("internships").findOne({ _id: app.internshipId }),
        getDb().collection("certificates").find({ applicationId: app._id }).toArray(),
      ]);

      const { _id, ...rest } = app;
      return {
        ...rest,
        id: _id.toString(),
        internshipId: app.internshipId.toString(),
        internship: internship ? {
          id: internship._id.toString(),
          title: internship.title,
          domain: internship.domain,
          locationType: internship.locationType,
          duration: internship.duration,
          type: internship.type,
          stipend: internship.stipend,
          perks: internship.perks ?? [],
        } : null,
        certificates: certificates.map(c => ({
          id: c._id.toString(),
          certificateId: c.certificateId,
          type: c.type,
          issuedAt: c.issuedAt,
          verifyUrl: c.verifyUrl,
          internshipTitle: c.internshipTitle,
          recipientName: c.recipientName,
        })),
      };
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Apply for an internship
// @ts-ignore
router.post("/:id/apply", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { resumeUrl, coverLetter } = req.body;
    const userId = req.user!.userId;
    const now = new Date();
    const internshipIdStr = String(req.params.id);

    // Check if internship exists and is currently open
    const internship = await getDb().collection("internships").findOne({ _id: new ObjectId(internshipIdStr) });
    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }

    const openFrom = new Date(internship.openFrom);
    const openUntil = new Date(internship.openUntil);
    const isOpen = now >= openFrom && now <= openUntil;

    if (!isOpen) {
      return res.status(400).json({ error: "This internship is not currently accepting applications." });
    }

    // Check if already applied
    const existingApplication = await getDb().collection("internship_applications").findOne({
      internshipId: new ObjectId(internshipIdStr),
      userId,
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied for this internship." });
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

    await getDb().collection("internship_applications").insertOne({
      _id: new ObjectId(),
      internshipId: new ObjectId(internshipIdStr),
      userId,
      ...payload,
      status: "pending",
      appliedAt: now,
    });

    // Send email asynchronously without blocking the response
    sendApplicationEmail(payload, internship).catch(console.error);


    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Public: verify a certificate by its unique ID (no auth needed)
router.get("/certificate/verify/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params;
    const cert = await getDb().collection("certificates").findOne({ certificateId });
    if (!cert) return res.status(404).json({ valid: false, error: "Certificate not found" });
    const { _id, ...rest } = cert;
    res.json({ valid: true, certificate: { ...rest, id: _id.toString(), applicationId: rest.applicationId?.toString(), internshipId: rest.internshipId?.toString() } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Public: get certificate data for full-page view (no auth needed)
router.get("/certificate/view/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params;
    const cert = await getDb().collection("certificates").findOne({ certificateId });
    if (!cert) return res.status(404).json({ error: "Certificate not found" });
    const { _id, ...rest } = cert;
    res.json({ ...rest, id: _id.toString(), applicationId: rest.applicationId?.toString(), internshipId: rest.internshipId?.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

