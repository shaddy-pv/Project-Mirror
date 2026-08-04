"use client";

import React, { useState, useEffect } from "react";
import PortalLoginGate from "@/components/portals/PortalLoginGate";
import {
  staffGetSalesDashboard,
  staffGetProducts,
  staffCreateProduct,
  staffUpdateProduct,
  staffDeleteProduct,
  staffGetOrders,
  staffUpdateOrderTracking,
  staffGetInquiries,
  staffUpdateInquiryStatus,
} from "@/lib/staff.functions";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Truck,
  Plus,
  Loader2,
  ExternalLink,
  MessageSquare,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function SalesPortalPage() {
  return (
    <PortalLoginGate
      portal="sales"
      title="Enginow Commerce & Revenue Operations"
      subtitle="Merchandise catalog, order fulfillment, tracking updates, and sales inquiries"
    >
      {(user) => <SalesDashboardContent user={user} />}
    </PortalLoginGate>
  );
}

function SalesDashboardContent({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "inquiries">("dashboard");
  const [loading, setLoading] = useState(true);

  const [salesSummary, setSalesSummary] = useState<any>({
    totalEnrollments: 0,
    totalOrders: 0,
    totalOrderRevenue: 0,
    totalReferralUses: 0,
    totalReferralDiscounts: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Product Modal
  const [productModal, setProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    id: "",
    title: "",
    price: "799",
    discountPrice: "599",
    category: "Apparel",
    description: "",
    imageUrl: "",
    inStock: true,
  });

  // Tracking Modal
  const [trackingModal, setTrackingModal] = useState<{ open: boolean; orderId: string; trackingId: string; trackingSite: string; status: string }>({
    open: false,
    orderId: "",
    trackingId: "",
    trackingSite: "https://www.delhivery.com/track",
    status: "shipped",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, prod, ord, inq] = await Promise.all([
        staffGetSalesDashboard("sales").catch(() => ({})),
        staffGetProducts("sales").catch(() => []),
        staffGetOrders("sales").catch(() => []),
        staffGetInquiries("sales", "sales").catch(() => []),
      ]);
      setSalesSummary(sum || {});
      setProducts(Array.isArray(prod) ? prod : []);
      setOrders(Array.isArray(ord) ? ord : []);
      setInquiries(Array.isArray(inq) ? inq : []);
    } catch (err: any) {
      toast.error("Failed to load commerce data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: productForm.title,
        price: Number(productForm.price) || 0,
        discountPrice: Number(productForm.discountPrice) || 0,
        category: productForm.category,
        description: productForm.description,
        imageUrl: productForm.imageUrl,
        inStock: productForm.inStock,
      };

      if (productForm.id) {
        await staffUpdateProduct("sales", productForm.id, payload);
        toast.success("Product updated!");
      } else {
        await staffCreateProduct("sales", payload);
        toast.success("New merchandise product added!");
      }
      setProductModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      await staffDeleteProduct("sales", id);
      toast.success("Product deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const handleSaveTracking = async () => {
    try {
      await staffUpdateOrderTracking("sales", trackingModal.orderId, {
        trackingId: trackingModal.trackingId,
        trackingSite: trackingModal.trackingSite,
        status: trackingModal.status,
      });
      toast.success("Order logistics tracking updated!");
      setTrackingModal({ open: false, orderId: "", trackingId: "", trackingSite: "", status: "shipped" });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update tracking");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Shop Revenue</p>
            <p className="text-xl font-bold text-emerald-400">₹{salesSummary.totalOrderRevenue ?? 0}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Orders</p>
            <p className="text-xl font-bold text-white">{orders.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Referral Uses</p>
            <p className="text-xl font-bold text-white">{salesSummary.totalReferralUses ?? 0}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-lg">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Products Catalog</p>
            <p className="text-xl font-bold text-white">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: "dashboard", label: "Revenue Overview" },
            { id: "products", label: "Merchandise Products", count: products.length },
            { id: "orders", label: "Orders & Fulfillment", count: orders.length },
            { id: "inquiries", label: "Sales Inquiries", count: inquiries.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300 font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "products" && (
          <Button
            size="sm"
            onClick={() => {
              setProductForm({
                id: "",
                title: "",
                price: "799",
                discountPrice: "599",
                category: "Apparel",
                description: "",
                imageUrl: "",
                inStock: true,
              });
              setProductModal(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Merchandise
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-xs">Loading sales console...</p>
        </div>
      ) : (
        <>
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <h3 className="text-base font-semibold text-white mb-2">Commerce Performance & Discounts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <p className="text-slate-400">Total Course Enrollments</p>
                    <p className="text-lg font-bold text-white">{salesSummary.totalEnrollments ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <p className="text-slate-400">Total Referral Discounts Granted</p>
                    <p className="text-lg font-bold text-emerald-400">₹{salesSummary.totalReferralDiscounts ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        p.inStock !== false ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {p.inStock !== false ? "In Stock" : "Out of Stock"}
                      </span>
                      <h4 className="font-semibold text-white text-sm mt-1">{p.title}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-slate-500 hover:text-red-400 h-7 w-7"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-white text-sm">₹{p.discountPrice || p.price}</span>
                      {p.discountPrice && p.price > p.discountPrice && (
                        <span className="text-slate-500 line-through ml-1.5">₹{p.price}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setProductForm({
                          id: p.id,
                          title: p.title,
                          price: String(p.price || 0),
                          discountPrice: String(p.discountPrice || 0),
                          category: p.category || "Apparel",
                          description: p.description || "",
                          imageUrl: p.imageUrl || "",
                          inStock: p.inStock !== false,
                        });
                        setProductModal(true);
                      }}
                      className="border-slate-700 text-xs h-7"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer Details</th>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Tracking Number</th>
                    <th className="p-3.5">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-[11px]">{o.id?.slice(-8)}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-white">{o.userFullName || "Customer"}</p>
                        <p className="text-[11px] text-slate-400">{o.userEmail}</p>
                        <p className="text-[10px] text-slate-500">{o.shippingAddress}</p>
                      </td>
                      <td className="p-3.5 font-medium text-slate-200">{o.productName}</td>
                      <td className="p-3.5 font-bold text-white">₹{o.amount}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          o.status === "delivered" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {o.status || "processing"}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {o.trackingId ? (
                          <a href={o.trackingSite || "#"} target="_blank" rel="noreferrer" className="text-primary underline flex items-center gap-1">
                            {o.trackingId}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600">Pending</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setTrackingModal({
                              open: true,
                              orderId: o.id,
                              trackingId: o.trackingId || "",
                              trackingSite: o.trackingSite || "https://www.delhivery.com/track",
                              status: o.status || "shipped",
                            })
                          }
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] gap-1"
                        >
                          <Truck className="h-3 w-3" />
                          Logistics
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* INQUIRIES TAB */}
          {activeTab === "inquiries" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Lead / Client Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Message</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-semibold text-white">{inq.name}</td>
                      <td className="p-3.5 text-slate-400">{inq.email}</td>
                      <td className="p-3.5 text-slate-300 max-w-sm">{inq.message}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          inq.status === "resolved" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {inq.status || "new"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await staffUpdateInquiryStatus("sales", inq.id, inq.status === "resolved" ? "new" : "resolved");
                            toast.success("Sales inquiry status updated!");
                            loadData();
                          }}
                          className="border-slate-700 text-xs h-7"
                        >
                          {inq.status === "resolved" ? "Mark New" : "Resolve"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Product Create/Edit Modal */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{productForm.id ? "Edit Product" : "Add Merchandise Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Product Name</label>
              <Input
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                placeholder="e.g. Enginow Developer Hoodie"
                className="bg-slate-950 border-slate-700 text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Original Price (₹)</label>
                <Input
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="e.g. 999"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Discounted Price (₹)</label>
                <Input
                  value={productForm.discountPrice}
                  onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                  placeholder="e.g. 799"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Category</label>
                <Input
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  placeholder="e.g. Apparel, Accessories"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Stock Status</label>
                <select
                  value={productForm.inStock ? "true" : "false"}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.value === "true" })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-100"
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Product Description</label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Product specifications, fabric, sizing..."
                className="bg-slate-950 border-slate-700 text-slate-100"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Image URL</label>
              <Input
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                placeholder="https://..."
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setProductModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tracking Modal */}
      <Dialog open={trackingModal.open} onOpenChange={(open) => setTrackingModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Order Tracking & Logistics</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Tracking ID / AWB</label>
              <Input
                value={trackingModal.trackingId}
                onChange={(e) => setTrackingModal((prev) => ({ ...prev, trackingId: e.target.value }))}
                placeholder="e.g. DELH19827346"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Tracking Website URL</label>
              <Input
                value={trackingModal.trackingSite}
                onChange={(e) => setTrackingModal((prev) => ({ ...prev, trackingSite: e.target.value }))}
                placeholder="https://www.delhivery.com/track"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Fulfillment Status</label>
              <select
                value={trackingModal.status}
                onChange={(e) => setTrackingModal((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-100"
              >
                <option value="processing">Processing</option>
                <option value="shipped">Shipped / In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTrackingModal({ open: false, orderId: "", trackingId: "", trackingSite: "", status: "shipped" })}>
              Cancel
            </Button>
            <Button onClick={handleSaveTracking}>Save Logistics Info</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
