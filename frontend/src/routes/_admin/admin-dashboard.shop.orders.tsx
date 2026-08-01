import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { adminListOrders, adminUpdateOrderTracking } from "@/lib/admin.functions";
import { Package, Loader2, Save, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/_admin/admin-dashboard/shop/orders")({
  loader: () => adminListOrders(),
  component: AdminOrdersPage,
});

type OrderRow = {
  id: string;
  productId: string;
  productName: string;
  userFullName: string;
  amount: number;
  status: string;
  trackingId?: string;
  trackingSite?: string;
  createdAt: string;
  address?: {
    state: string;
    city: string;
    pincode: string;
    landmark?: string;
    fullAddress: string;
  };
  customization?: {
    quotes?: string;
    coverImageUrl?: string;
    backSideName?: string;
  };
};

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

function OrderRow({ order, onSaved }: { order: OrderRow; onSaved: (updated: OrderRow) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [trackingId, setTrackingId] = useState(order.trackingId || "");
  const [trackingSite, setTrackingSite] = useState(order.trackingSite || "");
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateOrderTracking({ data: { id: order.id, trackingId, trackingSite, status } });
      onSaved({ ...order, trackingId, trackingSite, status });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    paid: "bg-blue-50 text-blue-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-600",
  };

  return (
    <div className="border-b hairline last:border-0">
      {/* Row summary */}
      <div
        className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/20 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[13.5px] truncate">{order.productName}</p>
          <p className="text-[12px] text-ink-soft">{order.userFullName}</p>
        </div>
        <div className="text-[13px] font-medium shrink-0">₹{order.amount}</div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${statusColor[order.status] || "bg-secondary text-ink-soft"}`}>
          {order.status}
        </span>
        <div className="text-[12px] text-ink-mute shrink-0">
          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
        <div className="text-ink-mute shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-5 pt-1 bg-secondary/10 space-y-4"
        >
          {/* Address */}
          {order.address && (
            <div>
              <p className="mono text-[10px] uppercase tracking-widest text-ink-mute mb-1.5">Delivery Address</p>
              <p className="text-[13px] text-ink">{order.address.fullAddress}</p>
              <p className="text-[13px] text-ink-soft">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
              {order.address.landmark && <p className="text-[12px] text-ink-mute">Near: {order.address.landmark}</p>}
            </div>
          )}

          {/* Customization */}
          {order.customization && (order.customization.quotes || order.customization.backSideName) && (
            <div>
              <p className="mono text-[10px] uppercase tracking-widest text-ink-mute mb-1.5">Diary Customization</p>
              {order.customization.quotes && <p className="text-[13px]">Quote: "{order.customization.quotes}"</p>}
              {order.customization.backSideName && <p className="text-[13px]">Name print: {order.customization.backSideName}</p>}
              {order.customization.coverImageUrl && (
                <img src={order.customization.coverImageUrl} alt="Custom cover" className="mt-2 h-20 w-20 rounded-lg object-cover border hairline" />
              )}
            </div>
          )}

          {/* Tracking & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-input bg-white px-3 py-2 text-[13.5px] outline-none focus:ring-1 focus:ring-ring"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Tracking ID</label>
              <input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. DTDC1234567890"
                className="mt-1.5 block w-full rounded-md border border-input bg-white px-3 py-2 text-[13.5px] outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Tracking Website URL</label>
              <input
                value={trackingSite}
                onChange={(e) => setTrackingSite(e.target.value)}
                placeholder="e.g. https://www.dtdc.in/track"
                className="mt-1.5 block w-full rounded-md border border-input bg-white px-3 py-2 text-[13.5px] outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saved ? "Saved!" : "Save Changes"}
            </button>
            {trackingSite && trackingId && (
              <a
                href={trackingSite}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border hairline px-4 py-2 text-[13px] text-ink-soft hover:bg-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Track Package
              </a>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AdminOrdersPage() {
  const initial = Route.useLoaderData() as unknown as OrderRow[];
  const [ordersList, setOrdersList] = useState<OrderRow[]>(initial);

  const handleSaved = (updated: OrderRow) => {
    setOrdersList((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shop Orders</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">{ordersList.length} order{ordersList.length !== 1 ? "s" : ""} total</p>
        </div>
      </div>

      {ordersList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline py-20 text-center">
          <Package className="h-10 w-10 text-ink-mute mb-3" />
          <p className="font-medium">No orders yet</p>
          <p className="mt-1 text-[13px] text-ink-soft">Orders will appear here once customers make purchases.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border hairline">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-3 bg-secondary/40 border-b hairline text-[12px] font-medium text-ink-soft">
            <div className="flex-1">Product / Customer</div>
            <div className="shrink-0">Amount</div>
            <div className="shrink-0 w-20">Status</div>
            <div className="shrink-0 w-24">Date</div>
            <div className="shrink-0 w-4" />
          </div>
          {ordersList.map((order) => (
            <OrderRow key={order.id} order={order} onSaved={handleSaved} />
          ))}
        </div>
      )}
    </div>
  );
}
