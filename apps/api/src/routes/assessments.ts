import { Router } from "express";
import { getDb } from "../db";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { requireStaffAuth, AuthenticatedStaffRequest } from "./staffAuth";
import { ObjectId } from "mongodb";

const router = Router();

// ─── Helper: validate 25 questions exactly ───────────────────────────────────

function validateAssessment(body: any): string | null {
  if (!body.title?.trim()) return "Title is required";
  if (!body.listingId || !body.listingType) return "listingId and listingType are required";
  if (!Array.isArray(body.modules) || body.modules.length === 0) return "At least one module is required";
  
  let totalQ = 0;
  for (let i = 0; i < body.modules.length; i++) {
    const mod = body.modules[i];
    if (!mod.title?.trim()) return `Module ${i + 1} must have a title`;
    if (!mod.timeLimitSeconds || mod.timeLimitSeconds < 60) return `Module ${i + 1} timer must be at least 60 seconds`;
    if (!Array.isArray(mod.questions) || mod.questions.length === 0) return `Module ${i + 1} must have at least 1 question`;
    for (let j = 0; j < mod.questions.length; j++) {
      const q = mod.questions[j];
      if (!q.text?.trim()) return `Question ${j + 1} in Module ${i + 1} must have text`;
      if (!Array.isArray(q.options) || q.options.length !== 4) return `Question ${j + 1} must have exactly 4 options`;
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) {
        return `Question ${j + 1} in Module ${i + 1} must have a valid correct answer (0-3)`;
      }
    }
    totalQ += mod.questions.length;
  }
  if (totalQ > 25) return `Total questions must not exceed 25 (currently ${totalQ})`;
  return null;
}

// ─── Admin: List all assessments ─────────────────────────────────────────────
// @ts-ignore
router.get("/", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    const role = req.staff?.role;
    const filter = role === "hr" ? { createdBy: req.staff!.staffId } : {};
    const assessments = await getDb().collection("assessments").find(filter).sort({ createdAt: -1 }).toArray();
    res.json(assessments.map(a => ({
      ...a,
      id: a._id.toString(),
      _id: undefined,
      // Strip correct answers from list view too
      modules: a.modules?.map((m: any) => ({
        ...m,
        questions: m.questions?.map((q: any) => ({ ...q, correctAnswer: undefined }))
      }))
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin: List all assessments WITH answers (for editing) ──────────────────
// @ts-ignore
router.get("/:id/edit", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (req.staff?.role !== "admin" && req.staff?.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const filter: any = { _id: new ObjectId(req.params.id as string) };
    if (req.staff?.role === "hr") {
      filter.createdBy = req.staff.staffId;
    }
    const assessment = await getDb().collection("assessments").findOne(filter);
    if (!assessment) return res.status(404).json({ error: "Assessment not found or access denied" });
    res.json({ ...assessment, id: assessment._id.toString(), _id: undefined });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin: Create assessment ─────────────────────────────────────────────────
// @ts-ignore
router.post("/", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (req.staff?.role !== "admin" && req.staff?.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized: HR or Admin role required" });
    }
    const err = validateAssessment(req.body);
    if (err) return res.status(400).json({ error: err });

    const doc = {
      ...req.body,
      createdBy: req.staff.staffId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await getDb().collection("assessments").insertOne({ _id: new ObjectId(), ...doc });
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin: Update assessment ─────────────────────────────────────────────────
// @ts-ignore
router.put("/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (req.staff?.role !== "admin" && req.staff?.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const err = validateAssessment(req.body);
    if (err) return res.status(400).json({ error: err });

    const filter: any = { _id: new ObjectId(req.params.id as string) };
    if (req.staff?.role === "hr") {
      filter.createdBy = req.staff.staffId;
    }

    const existing = await getDb().collection("assessments").findOne(filter);
    if (!existing) return res.status(404).json({ error: "Assessment not found or access denied" });

    await getDb().collection("assessments").updateOne(
      filter,
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin: Delete assessment ─────────────────────────────────────────────────
// @ts-ignore
router.delete("/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (req.staff?.role !== "admin" && req.staff?.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const filter: any = { _id: new ObjectId(req.params.id as string) };
    if (req.staff?.role === "hr") {
      filter.createdBy = req.staff.staffId;
    }
    const existing = await getDb().collection("assessments").findOne(filter);
    if (!existing) return res.status(404).json({ error: "Assessment not found or access denied" });

    await getDb().collection("assessments").deleteOne(filter);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin: Get all results for an assessment ─────────────────────────────────
// @ts-ignore
router.get("/:id/results", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (req.staff?.role !== "admin" && req.staff?.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const filter: any = { _id: new ObjectId(req.params.id as string) };
    if (req.staff?.role === "hr") {
      filter.createdBy = req.staff.staffId;
    }
    const existing = await getDb().collection("assessments").findOne(filter);
    if (!existing) return res.status(404).json({ error: "Assessment not found or access denied" });

    const results = await getDb().collection("assessment_sessions")
      .find({ assessmentId: new ObjectId(req.params.id as string) })
      .sort({ completedAt: -1 })
      .toArray();
    res.json(results.map(r => ({ ...r, id: r._id.toString(), _id: undefined })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Learner: Get assessment info (no correct answers) ───────────────────────
// @ts-ignore
router.get("/:id/info", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const assessment = await getDb().collection("assessments").findOne({ _id: new ObjectId(id as string) });
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    // Check eligibility: must have an application with status "oa" and assessmentId matching
    const hasAccess = await (async () => {
      const q = { userId, assessmentId: id, status: "oa" };
      const careerApp = await getDb().collection("career_applications").findOne({ userId, assessmentId: id, status: "oa" });
      if (careerApp) return true;
      const internshipApp = await getDb().collection("internship_applications").findOne({ userId, assessmentId: id, status: "oa" });
      return !!internshipApp;
    })();

    if (!hasAccess) return res.status(403).json({ error: "You are not authorised to take this assessment" });

    // Check if already completed
    const session = await getDb().collection("assessment_sessions").findOne({ assessmentId: new ObjectId(id as string), userId });

    // Strip correct answers
    const safeAssessment = {
      ...assessment,
      id: assessment._id.toString(),
      _id: undefined,
      modules: assessment.modules?.map((m: any, mIdx: number) => ({
        ...m,
        questions: m.questions?.map((q: any, qIdx: number) => ({
          id: q.id || `${mIdx}-${qIdx}`,
          text: q.text,
          options: q.options,
          // correctAnswer intentionally omitted
        })),
      })),
    };

    res.json({
      assessment: safeAssessment,
      session: session ? {
        completedAt: session.completedAt,
        moduleStarts: session.moduleStarts,
        completedModules: session.completedModules || [],
      } : null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Learner: Start a module (records start time server-side) ─────────────────
// @ts-ignore
router.post("/:id/start-module", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { moduleIndex } = req.body;
    const userId = req.user!.userId;

    // Verify access
    const assessment = await getDb().collection("assessments").findOne({ _id: new ObjectId(id as string) });
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    const hasAccess = await (async () => {
      const c = await getDb().collection("career_applications").findOne({ userId, assessmentId: id, status: "oa" });
      if (c) return true;
      const i = await getDb().collection("internship_applications").findOne({ userId, assessmentId: id, status: "oa" });
      return !!i;
    })();
    if (!hasAccess) return res.status(403).json({ error: "Unauthorised" });

    // Don't allow starting a module that's already been completed
    const session = await getDb().collection("assessment_sessions").findOne({ assessmentId: new ObjectId(id as string), userId });
    if (session?.completedModules?.includes(moduleIndex)) {
      return res.status(400).json({ error: "Module already completed" });
    }

    // Record start time (only once per module)
    const startKey = `moduleStarts.${moduleIndex}`;
    await getDb().collection("assessment_sessions").updateOne(
      { assessmentId: new ObjectId(id as string), userId },
      {
        $setOnInsert: { assessmentId: new ObjectId(id as string), userId, completedModules: [], createdAt: new Date() },
        $set: { updatedAt: new Date() },
        // Only set start time if not already set
      },
      { upsert: true }
    );

    // Set the start time only if not already set
    const updated = await getDb().collection("assessment_sessions").findOne({ assessmentId: new ObjectId(id as string), userId });
    if (!updated?.moduleStarts?.[moduleIndex]) {
      await getDb().collection("assessment_sessions").updateOne(
        { assessmentId: new ObjectId(id as string), userId },
        { $set: { [`moduleStarts.${moduleIndex}`]: new Date() } }
      );
    }

    res.json({ success: true, startedAt: updated?.moduleStarts?.[moduleIndex] || new Date() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Learner: Submit a module ─────────────────────────────────────────────────
// @ts-ignore
router.post("/:id/submit-module", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { moduleIndex, answers } = req.body; // answers: { [questionIndex]: selectedOption }
    const userId = req.user!.userId;

    const assessment = await getDb().collection("assessments").findOne({ _id: new ObjectId(id as string) });
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    // Check session & timer
    const session = await getDb().collection("assessment_sessions").findOne({ assessmentId: new ObjectId(id as string), userId });
    if (!session?.moduleStarts?.[moduleIndex]) {
      return res.status(400).json({ error: "Module not started" });
    }
    if (session?.completedModules?.includes(moduleIndex)) {
      return res.status(400).json({ error: "Module already submitted" });
    }

    const module = assessment.modules[moduleIndex];
    const startedAt = new Date(session.moduleStarts[moduleIndex]);
    const elapsedSeconds = (Date.now() - startedAt.getTime()) / 1000;
    const isLate = elapsedSeconds > module.timeLimitSeconds + 30; // 30s grace period

    // Auto-grade this module's answers
    let correctInModule = 0;
    const gradedAnswers = module.questions.map((q: any, qIdx: number) => {
      const selected = answers?.[qIdx] ?? -1;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctInModule++;
      return { questionIndex: qIdx, selected, isCorrect };
    });

    await getDb().collection("assessment_sessions").updateOne(
      { assessmentId: new ObjectId(id as string), userId },
      {
        $set: {
          [`moduleAnswers.${moduleIndex}`]: gradedAnswers,
          [`moduleScores.${moduleIndex}`]: correctInModule,
          [`moduleIsLate.${moduleIndex}`]: isLate,
          updatedAt: new Date(),
        },
        $addToSet: { completedModules: moduleIndex },
      }
    );

    res.json({ success: true, correctInModule, totalInModule: module.questions.length, isLate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Learner: Complete assessment (final submit) ───────────────────────────────
// @ts-ignore
router.post("/:id/complete", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const session = await getDb().collection("assessment_sessions").findOne({ assessmentId: new ObjectId(id as string), userId });
    if (!session) return res.status(400).json({ error: "No session found" });
    if (session.completedAt) return res.status(400).json({ error: "Already completed" });

    // Calculate total score
    const moduleScores: Record<string, number> = session.moduleScores || {};
    const totalScore = Object.values(moduleScores).reduce((sum: number, s: any) => sum + (s as number), 0);

    await getDb().collection("assessment_sessions").updateOne(
      { assessmentId: new ObjectId(id as string), userId },
      { $set: { completedAt: new Date(), totalScore, updatedAt: new Date() } }
    );

    // Update related applications to signal the dashboard
    const db = getDb();
    await db.collection("internship_applications").updateMany(
      { assessmentId: id, userId },
      { $set: { hasCompletedOA: true, oaSubmittedAt: new Date() } }
    );
    await db.collection("career_applications").updateMany(
      { assessmentId: id, userId },
      { $set: { hasCompletedOA: true, oaSubmittedAt: new Date() } }
    );

    res.json({ success: true, totalScore });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin: Get specific user's detailed OA result ────────────────────────────
// @ts-ignore
router.get("/:id/results/:userId", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    const { id, userId } = req.params;
    const db = getDb();
    
    // Fetch the assessment (to get correct answers and questions)
    const filter: any = { _id: new ObjectId(id as string) };
    if (req.staff?.role === "hr") {
      filter.createdBy = req.staff!.staffId;
    }
    const assessment = await db.collection("assessments").findOne(filter);
    if (!assessment) return res.status(404).json({ error: "Assessment not found or access denied" });

    // Fetch the session
    const session = await db.collection("assessment_sessions").findOne({ assessmentId: new ObjectId(id as string), userId });
    if (!session) return res.status(404).json({ error: "Session not found for user" });

    // Send back a combined analysis payload
    res.json({
      assessment,
      session
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
