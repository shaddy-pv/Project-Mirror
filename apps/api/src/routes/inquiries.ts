import { Router } from "express";
import { getDb } from "../db";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { ObjectId } from "mongodb";
import { userRoles, AppRole } from "../collections";

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

// @ts-ignore
router.post("/submit", async (req, res) => {
  try {
    const { category, name, email, message } = req.body;
    if (!["sales", "career", "custom"].includes(category)) {
      return res.status(400).json({ error: "Invalid category. Must be sales, career, or custom." });
    }

    const doc = {
      category,
      name,
      email,
      message,
      status: "new", // new, reviewed, resolved
      createdAt: new Date(),
    };

    const result = await getDb().collection("inquiries").insertOne({ _id: new ObjectId(), ...doc });
    res.json({ success: true, id: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.get("/", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // Only HR, Sales, and Admin can read inquiries
    await requireRoles(req.user!.userId, ["hr", "sales"]);
    const { category } = req.query;

    const filter: any = {};
    if (category) {
      filter.category = String(category);
    }

    const docs = await getDb().collection("inquiries").find(filter).sort({ createdAt: -1 }).toArray();
    res.json(docs.map((d) => {
      const { _id, ...rest } = d;
      return { ...rest, id: _id.toString() };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @ts-ignore
router.patch("/:id/status", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireRoles(req.user!.userId, ["hr", "sales"]);
    const id = String(req.params.id);
    const { status } = req.body;

    if (!["new", "reviewed", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    await getDb().collection("inquiries").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
