import { Router } from "express";
import { getDb } from "../db";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { userRoles } from "../collections";

const router = Router();

async function requireSalesOrAdmin(userId: string) {
  const roleDocs = await userRoles().find({ userId }).toArray();
  const roles = roleDocs.map(r => r.role);
  if (roles.includes("admin") || roles.includes("sales")) return true;
  throw new Error("Unauthorized: sales or admin role required");
}

// @ts-ignore
router.get("/dashboard", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await requireSalesOrAdmin(req.user!.userId);

    const [enrollments, orders, referrals] = await Promise.all([
      getDb().collection("course_enrollments").find({}).toArray(),
      getDb().collection("shop_orders").find({ status: { $ne: "cancelled" } }).toArray(),
      getDb().collection("referrals").find({}).toArray()
    ]);

    const totalEnrollments = enrollments.length;
    // Calculate total revenue from orders. 
    // Wait, shop_orders has an amount field. Let's sum it up.
    const totalOrderRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // Tally referral code usage
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
