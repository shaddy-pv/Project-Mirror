import { Router } from "express";
import { getDb } from "../db";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { ObjectId } from "mongodb";
import { userRoles } from "../collections";

const router = Router();

async function requireAdmin(userId: string) {
  const adminRole = await userRoles().findOne({ userId, role: "admin" });
  if (!adminRole) {
    throw new Error("Unauthorized: admin role required");
  }
  return true;
}

// @ts-ignore
router.get("/", async (req, res) => {
  try {
    const docs = await getDb().collection("blogs").find({ status: "published" }).sort({ createdAt: -1 }).toArray();
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
    // Anyone authenticated can create a blog
    const doc = {
      ...req.body,
      status: "pending_approval",
      authorId: req.user!.userId,
      createdAt: now,
      updatedAt: now,
    };
    
    // Check if the user is an admin. If so, they can publish directly if they sent status: "published"
    const isAdmin = await userRoles().findOne({ userId: req.user!.userId, role: "admin" });
    if (isAdmin && req.body.status === "published") {
      doc.status = "published";
    }

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
    
    const isAdmin = await userRoles().findOne({ userId: req.user!.userId, role: "admin" });
    if (!isAdmin && existing.authorId !== req.user!.userId) {
      return res.status(403).json({ error: "Only the author or an admin can edit this blog" });
    }

    let status = req.body.status || existing.status;
    if (!isAdmin && status === "published") {
      status = "pending_approval";
    }

    await getDb().collection("blogs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, status, updatedAt: new Date() } }
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
    
    const isAdmin = await userRoles().findOne({ userId: req.user!.userId, role: "admin" });
    if (!isAdmin && existing.authorId !== req.user!.userId) {
      return res.status(403).json({ error: "Only the author or an admin can delete this blog" });
    }

    await getDb().collection("blogs").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/:id/approve", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
router.patch("/:id/reject", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireAdmin(req.user!.userId);
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
