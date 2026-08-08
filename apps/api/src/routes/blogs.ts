import { Router } from "express";
import { getDb } from "../db";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { requireStaffAuth, AuthenticatedStaffRequest } from "./staffAuth";
import { ObjectId } from "mongodb";

const router = Router();

// @ts-ignore
router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let query: any = { status: "published" };
    
    // If request comes with a Bearer token, assume it's from the staff panel and fetch all
    if (authHeader && authHeader.startsWith("Bearer ")) {
      query = {}; // all blogs
    }

    const docs = await getDb().collection("blogs").find(query).sort({ createdAt: -1 }).toArray();
    res.json(docs.map(d => {
      const { _id, ...rest } = d;
      return { ...rest, id: _id.toString() };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const now = new Date();
    const doc = {
      ...req.body,
      status: "pending_approval",
      authorId: req.user!.userId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await getDb().collection("blogs").insertOne({ _id: new ObjectId(), ...doc });
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/:id", async (req, res) => {
  try {
    const doc = await getDb().collection("blogs").findOne({ _id: new ObjectId(String(req.params.id)) });
    if (!doc) return res.status(404).json({ error: "Not found" });
    const { _id, ...rest } = doc;
    res.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const existing = await getDb().collection("blogs").findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    
    if (existing.authorId !== req.user!.userId) {
      return res.status(403).json({ error: "Only the author can edit this blog" });
    }

    await getDb().collection("blogs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, status: "pending_approval", updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/:id", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const existing = await getDb().collection("blogs").findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "Not found" });
    
    if (existing.authorId !== req.user!.userId) {
      return res.status(403).json({ error: "Only the author can delete this blog" });
    }

    await getDb().collection("blogs").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Staff Admin Approve/Reject
// @ts-ignore
router.patch("/:id/approve", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    const id = String(req.params.id);
    await getDb().collection("blogs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "published", updatedAt: new Date(), rejectionReason: "" } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/:id/reject", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    const id = String(req.params.id);
    const { reason } = req.body;
    await getDb().collection("blogs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "draft", rejectionReason: reason || "Rejected", updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
