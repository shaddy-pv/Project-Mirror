import { Router } from "express";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { ensureUserProfile } from "../collections";

const router = Router();

// @ts-ignore
router.post("/complete-profile", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.user!;
    await ensureUserProfile(userId, req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
