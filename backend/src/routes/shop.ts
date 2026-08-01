import { Router } from "express";
import { ObjectId } from "mongodb";
import { requireFirebaseAuth, AuthenticatedRequest } from "../middleware/auth";
import { products, orders, profiles } from "../collections";
import { cacheGet, cacheSet, cacheDel } from "../utils/cache";

const router = Router();
const PRODUCTS_CACHE_KEY = "shop:products";

// GET /api/shop (Public)
router.get("/", async (req, res) => {
  try {
    const cached = await cacheGet(PRODUCTS_CACHE_KEY);
    if (cached) return res.json(cached);

    const docs = await products().find({ status: "published" }).sort({ createdAt: -1 }).toArray();
    const result = docs.map((d) => {
      const { _id, ...rest } = d;
      return { ...rest, id: _id.toString() };
    });

    await cacheSet(PRODUCTS_CACHE_KEY, result, 120);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shop/my-orders (Authenticated) — MUST be before /:slug
// @ts-ignore
router.get("/my-orders", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.user!;
    const myOrders = await orders().find({ userId }).sort({ createdAt: -1 }).toArray();

    // Enrich with product details
    const productIds = myOrders.map(o => o.productId);
    const prods = productIds.length
      ? await products().find({ _id: { $in: productIds } }).toArray()
      : [];
    const prodMap = new Map(prods.map(p => [p._id.toString(), p]));

    const enriched = myOrders.map(o => {
      const { _id, ...rest } = o;
      const product = prodMap.get(o.productId.toString());
      return {
        ...rest,
        id: _id.toString(),
        productId: o.productId.toString(),
        productName: product?.name || "Unknown Product",
        productImage: product?.images?.[0] || null,
        productCategory: product?.category || "",
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/shop/checkout (Authenticated)
// @ts-ignore
router.post("/checkout", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.user!;
    const { productId, amount, referralCode, razorpayOrderId, razorpayPaymentId, address, customization } = req.body;

    if (!productId || !address) {
      return res.status(400).json({ error: "Product ID and Address are required." });
    }

    const product = await products().findOne({ _id: new ObjectId(String(productId)), status: "published" });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let discountApplied = 0;
    if (referralCode) {
      const owner = await profiles().findOne({ referralCode });
      if (owner && !owner.referralExpired && owner._id.toString() !== userId) {
        discountApplied = 15;
        await require("../collections").referrals().insertOne({
          _id: new ObjectId(),
          referralCode,
          referrerId: owner._id,
          referredUserId: userId,
          resourceType: "product",
          resourceId: productId,
          usedAt: new Date(),
          discountApplied: 15,
          paid: false,
        });

        const newCount = (owner.referralUsageCount ?? 0) + 1;
        await profiles().updateOne(
          { _id: owner._id },
          { $set: { referralUsageCount: newCount, referralExpired: newCount >= 5, updatedAt: new Date() } }
        );
      }
    }

    const orderDoc = {
      userId,
      productId: product._id,
      amount: Number(amount),
      ...(referralCode && { referralCode }),
      ...(discountApplied > 0 && { discountApplied }),
      razorpayOrderId,
      razorpayPaymentId,
      status: razorpayPaymentId ? "paid" : "pending",
      address,
      customization,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await orders().insertOne(orderDoc as any);

    res.json({ success: true, orderId: result.insertedId.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/shop/orders/:id/rate (Authenticated)
// @ts-ignore
router.post("/orders/:id/rate", requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.user!;
    const { rating } = req.body;
    const orderId = req.params.id;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating" });
    }

    const order = await orders().findOne({ _id: new ObjectId(String(orderId)), userId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "delivered") return res.status(400).json({ error: "Order must be delivered to rate" });

    // Update order with rating
    await orders().updateOne(
      { _id: new ObjectId(String(orderId)) },
      { $set: { rating, updatedAt: new Date() } }
    );

    // Recalculate product average rating
    const productId = order.productId;
    const allRatedOrders = await orders().find({ productId, rating: { $gt: 0 } }).toArray();
    
    let avgRating = 0;
    if (allRatedOrders.length > 0) {
      const sum = allRatedOrders.reduce((acc, o) => acc + (o.rating || 0), 0);
      avgRating = Math.round((sum / allRatedOrders.length) * 10) / 10;
    }

    await products().updateOne(
      { _id: productId },
      { $set: { rating: avgRating, updatedAt: new Date() } }
    );
    await cacheDel(PRODUCTS_CACHE_KEY);

    res.json({ success: true, avgRating });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shop/:slug (Public) — MUST be after all named routes
router.get("/:slug", async (req, res) => {
  try {
    const doc = await products().findOne({ slug: req.params.slug, status: "published" });
    if (!doc) return res.status(404).json({ error: "Product not found" });

    const { _id, ...rest } = doc;
    res.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
