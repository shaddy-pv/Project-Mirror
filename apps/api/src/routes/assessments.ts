import { Router } from "express";
import { getDb } from "../db";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { ObjectId } from "mongodb";
import { assessments, userRoles, AppRole } from "../collections";

const router = Router();

async function requireRoles(userId: string, allowedRoles: AppRole[]) {
  const roleDocs = await userRoles().find({ userId }).toArray();
  const roles = roleDocs.map((r) => r.role);
  if (roles.includes("admin")) return "admin";
  for (const r of allowedRoles) {
    if (roles.includes(r)) return r;
  }
  throw new Error(`Unauthorized: requires one of ${allowedRoles.join(", ")}`);
}

// Create assessment (HR/Admin)
// @ts-ignore
router.post("/", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireRoles(req.user!.userId, ["hr"]);
    const doc = {
      ...req.body,
      createdBy: req.user!.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await getDb().collection("assessments").insertOne({ _id: new ObjectId(), ...doc });
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get assessment to take (Learner)
// @ts-ignore
router.get("/:id/take", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;
    const assessment = await getDb().collection("assessments").findOne({ _id: new ObjectId(id) });
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    // Check if the user has an application for the linked listing that is "shortlisted"
    const hasCareerApp = await getDb().collection("career_applications").findOne({
      userId,
      careerId: new ObjectId(assessment.listingId),
      status: "shortlisted",
    });
    
    const hasInternshipApp = await getDb().collection("internship_applications").findOne({
      userId,
      internshipId: new ObjectId(assessment.listingId),
      status: "shortlisted",
    });

    if (!hasCareerApp && !hasInternshipApp) {
      return res.status(403).json({ error: "You are not shortlisted for the listing associated with this assessment" });
    }

    const { _id, ...rest } = assessment;
    res.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit assessment results (Learner)
// @ts-ignore
router.post("/:id/submit", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.userId;
    
    const doc = {
      assessmentId: new ObjectId(id),
      userId,
      answers: req.body.answers,
      submittedAt: new Date(),
    };

    const result = await getDb().collection("assessment_results").insertOne({ _id: new ObjectId(), ...doc });
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get results (HR/Admin)
// @ts-ignore
router.get("/:id/results", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireRoles(req.user!.userId, ["hr"]);
    const id = String(req.params.id);
    const results = await getDb().collection("assessment_results").find({ assessmentId: new ObjectId(id) }).sort({ submittedAt: -1 }).toArray();
    res.json(results.map(r => ({ ...r, id: r._id.toString(), _id: undefined })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireRoles(req.user!.userId, ["hr"]);
    const id = String(req.params.id);
    await getDb().collection("assessments").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireRoles(req.user!.userId, ["hr"]);
    const id = String(req.params.id);
    await getDb().collection("assessments").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
