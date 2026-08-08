import { Router } from "express";
import { getDb } from "../db";
import { requireStaffAuth, AuthenticatedStaffRequest } from "./staffAuth";
import { ObjectId } from "mongodb";

const router = Router();

// @ts-ignore
router.get("/", async (req, res) => {
  try {
    const tests = await getDb().collection("practice_tests").find({}).sort({ createdAt: -1 }).toArray();
    res.json(tests.map(t => {
      const { _id, ...rest } = t;
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
      return res.status(403).json({ error: "Only Admins and Educators can add practice tests." });
    }
    const doc = {
      ...req.body,
      createdBy: req.staff.staffId,
      createdAt: new Date(),
    };
    const result = await getDb().collection("practice_tests").insertOne({ _id: new ObjectId(), ...doc });
    res.json({ id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/:id", async (req, res) => {
  try {
    const test = await getDb().collection("practice_tests").findOne({ _id: new ObjectId(String(req.params.id)) });
    if (!test) return res.status(404).json({ error: "Not found" });
    const { _id, ...rest } = test;
    res.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
