import { Router } from "express";
import { getDb } from "../db";
import { requireStaffAuth, AuthenticatedStaffRequest } from "./staffAuth";
import { ObjectId } from "mongodb";

const router = Router();

// @ts-ignore
router.get("/", async (req, res) => {
  try {
    const resources = await getDb().collection("resources").find({}).sort({ createdAt: -1 }).toArray();
    res.json(resources.map(r => {
      const { _id, ...rest } = r;
      return { ...rest, id: _id.toString() };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.post("/", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (req.staff?.role !== "admin" && req.staff?.role !== "educator") {
      return res.status(403).json({ error: "Only Admins and Educators can upload resources." });
    }
    const doc = {
      ...req.body,
      createdBy: req.staff.staffId,
      createdAt: new Date(),
    };
    const result = await getDb().collection("resources").insertOne({ _id: new ObjectId(), ...doc });
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.put("/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (req.staff?.role !== "admin" && req.staff?.role !== "educator") {
      return res.status(403).json({ error: "Only Admins and Educators can update resources." });
    }
    const id = String(req.params.id);
    await getDb().collection("resources").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.delete("/:id", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (req.staff?.role !== "admin" && req.staff?.role !== "educator") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await getDb().collection("resources").deleteOne({ _id: new ObjectId(String(req.params.id)) });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
