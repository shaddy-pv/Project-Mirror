import { Router } from "express";
import { getDb } from "../db";
import { requireStaffAuth, AuthenticatedStaffRequest } from "./staffAuth";

const router = Router();

// @ts-ignore
router.get("/dashboard", requireStaffAuth, async (req: AuthenticatedStaffRequest, res) => {
  try {
    if (!req.staff || (req.staff.role !== "admin" && req.staff.role !== "sales")) {
      return res.status(403).json({ error: "Unauthorized: sales or admin role required" });
    }

    const [enrollments, orders, referrals] = await Promise.all([
      getDb().collection("course_enrollments").find({}).toArray(),
      getDb().collection("shop_orders").find({ status: { $ne: "cancelled" } }).toArray(),
      getDb().collection("referrals").find({}).toArray()
    ]);

    const totalEnrollments = enrollments.length;
    const totalOrderRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    const totalReferralUses = referrals.length;
    const totalReferralDiscounts = referrals.reduce((sum, ref) => sum + (ref.discountApplied || 0), 0);

    res.json({
      totalEnrollments,
      totalOrders: orders.length,
      totalOrderRevenue,
      totalReferralUses,
      totalReferralDiscounts,
      recentActivity: [
        ...enrollments.slice(-5).map(e => ({ type: "enrollment", date: e.enrolledAt, id: e._id.toString() })),
        ...orders.slice(-5).map(o => ({ type: "order", date: o.createdAt, id: o._id.toString() })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
