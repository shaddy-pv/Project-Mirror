import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Package, Plus, Trash2, Pencil, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { EmptyState } from "@/components/panel/EmptyState";
import { PageHeader } from "@/components/panel/PageHeader";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { ConfirmDialog } from "@/components/panel/ConfirmDialog";
import type { Product, Order } from "@/lib/types";
import {
  listProducts,
  saveProduct,
  deleteProduct,
  listOrders,
  updateOrderTracking,
} from "@/mocks/api";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop & Orders — Enginow Panel" }] }),
  component: ShopPage,
});

const EMPTY_PRODUCT: Partial<Product> = {
  name: "",
  description: "",
  price: 0,
  category: "Diary",
  imageUrl: "",
  stock: 100,
  status: "active",
};

function ShopPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"products" | "orders">("products");

  // Products state
  const [prodOpen, setProdOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Partial<Product> & { id?: string }>(EMPTY_PRODUCT);
  const [deleteProdId, setDeleteProdId] = useState<string | null>(null);

  // Orders state
  const [orderOpen, setOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [trackingId, setTrackingId] = useState("");
  const [trackingSite, setTrackingSite] = useState("");
  const [orderStatus, setOrderStatus] = useState<Order["status"]>("pending");

  const { data: products = [], isPending: prodsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: listProducts,
  });

  const { data: orders = [], isPending: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: listOrders,
  });

  const saveProdMut = useMutation({
    mutationFn: saveProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editingProd.id ? "Product updated" : "Product created");
      setProdOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteProdMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
      setDeleteProdId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateOrderMut = useMutation({
    mutationFn: ({ id, tracking, status, site }: { id: string; tracking: string; status: Order["status"]; site?: string }) =>
      updateOrderTracking(id, tracking, status, site),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order updated successfully");
      setOrderOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const productCols: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortValue: (r) => r.name,
      cell: (r) => (
        <div className="flex items-center gap-3">
          {r.imageUrl ? (
            <img src={r.imageUrl} alt={r.name} className="h-9 w-9 rounded-md object-cover border" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium leading-none">{r.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{r.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortValue: (r) => r.price,
      cell: (r) => `₹${r.price}`,
    },
    {
      key: "stock",
      header: "Stock",
      sortValue: (r) => r.stock,
      cell: (r) => r.stock,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status === "active" ? "live" : "draft"} />,
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setEditingProd({ ...r });
              setProdOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteProdId(r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const orderCols: Column<Order>[] = [
    {
      key: "productName",
      header: "Product",
      sortValue: (r) => r.productName || "",
      cell: (r) => (
        <div>
          <p className="font-medium leading-none">{r.productName || "Product"}</p>
          <p className="text-xs text-muted-foreground mt-1">By {r.userName || "Customer"}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortValue: (r) => r.total,
      cell: (r) => `₹${r.total}`,
    },
    {
      key: "status",
      header: "Order Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "trackingId",
      header: "Tracking ID",
      cell: (r) => r.trackingId ? (
        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{r.trackingId}</span>
      ) : (
        <span className="text-xs text-muted-foreground italic">Not dispatched</span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortValue: (r) => r.createdAt,
      cell: (r) => r.createdAt,
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditingOrder(r);
            setTrackingId(r.trackingId ?? "");
            setTrackingSite(r.trackingSite ?? "");
            setOrderStatus(r.status);
            setOrderOpen(true);
          }}
        >
          <Truck className="mr-1.5 h-3.5 w-3.5" /> Manage
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Shop & Merchandise"
        subtitle="Manage products, pricing, inventory and process customer orders."
        helpTitle="About Shop & Orders"
        helpLines={[
          "View customer orders and update dispatch tracking numbers.",
          "Add new products, update prices, or change stock availability.",
        ]}
        actions={
          tab === "products" ? (
            <Button
              onClick={() => {
                setEditingProd(EMPTY_PRODUCT);
                setProdOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          ) : undefined
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "products" | "orders")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" /> Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingBag className="h-4 w-4" /> Orders ({orders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {prodsLoading ? (
            <p className="text-sm text-muted-foreground">Loading products…</p>
          ) : (
            <DataTable
              rows={products}
              columns={productCols}
              rowKey={(r) => r.id}
              searchPlaceholder="Search products by name or category"
              searchIn={(r) => `${r.name} ${r.category}`}
              emptyState={
                <EmptyState
                  icon={Package}
                  message="No shop products found. Click 'Add Product' to list one."
                />
              }
            />
          )}
        </TabsContent>

        <TabsContent value="orders">
          {ordersLoading ? (
            <p className="text-sm text-muted-foreground">Loading orders…</p>
          ) : (
            <DataTable
              rows={orders}
              columns={orderCols}
              rowKey={(r) => r.id}
              searchPlaceholder="Search orders by customer or product"
              searchIn={(r) => `${r.userName} ${r.productName || ""} ${r.trackingId || ""}`}
              emptyState={
                <EmptyState
                  icon={ShoppingBag}
                  message="No customer orders yet."
                />
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Product Drawer */}
      <Sheet open={prodOpen} onOpenChange={setProdOpen}>
        <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editingProd.id ? "Edit Product" : "New Product"}</SheetTitle>
            <SheetDescription>Fill in product details and pricing.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 px-1 pb-8">
            <div className="space-y-1.5">
              <Label>Product Name</Label>
              <Input
                value={editingProd.name ?? ""}
                onChange={(e) => setEditingProd((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Enginow Premium Diary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={editingProd.category ?? ""}
                  onChange={(e) => setEditingProd((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Diary, T-Shirt, Stickers"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={editingProd.price ?? 0}
                  onChange={(e) => setEditingProd((p) => ({ ...p, price: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={editingProd.stock ?? 100}
                  onChange={(e) => setEditingProd((p) => ({ ...p, stock: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={editingProd.status ?? "active"}
                  onValueChange={(v) => setEditingProd((p) => ({ ...p, status: v as Product["status"] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active / In Stock</SelectItem>
                    <SelectItem value="inactive">Inactive / Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                value={editingProd.imageUrl ?? ""}
                onChange={(e) => setEditingProd((p) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={editingProd.description ?? ""}
                onChange={(e) => setEditingProd((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the product..."
              />
            </div>
            <Button
              className="w-full"
              onClick={() => saveProdMut.mutate(editingProd)}
              disabled={saveProdMut.isPending || !editingProd.name}
            >
              {saveProdMut.isPending ? "Saving…" : editingProd.id ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Order Tracking Sheet */}
      <Sheet open={orderOpen} onOpenChange={setOrderOpen}>
        <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Order #{editingOrder?.id.slice(-6).toUpperCase()}</SheetTitle>
            <SheetDescription>Customer: {editingOrder?.userName} · ₹{editingOrder?.total}</SheetDescription>
          </SheetHeader>
          {editingOrder && (
            <div className="mt-6 space-y-5 px-1 pb-8">
              {/* Product Info */}
              <div className="rounded-lg border p-3.5 bg-muted/20">
                <p className="font-medium text-sm">{editingOrder.productName}</p>
                <p className="text-xs text-muted-foreground mt-1">Amount: ₹{editingOrder.total}</p>
              </div>

              {/* Delivery Address */}
              {editingOrder.address && (
                <div className="rounded-lg border p-3.5 bg-muted/20 text-xs space-y-1">
                  <p className="font-semibold text-foreground text-sm">Delivery Address</p>
                  <p>{editingOrder.address.fullAddress}</p>
                  <p>{editingOrder.address.city}, {editingOrder.address.state} - {editingOrder.address.pincode}</p>
                </div>
              )}

              {/* Customization Details */}
              {editingOrder.customization && (
                <div className="rounded-lg border p-3.5 bg-muted/20 text-xs space-y-1">
                  <p className="font-semibold text-foreground text-sm">Customization</p>
                  {editingOrder.customization.quotes && <p>Quote: "{editingOrder.customization.quotes}"</p>}
                  {editingOrder.customization.backSideName && <p>Name: {editingOrder.customization.backSideName}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Order Status</Label>
                <Select value={orderStatus} onValueChange={(v) => setOrderStatus(v as Order["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Courier Tracking ID</Label>
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. DTDC90002312 or AWB8923412"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Tracking Website</Label>
                <Input
                  value={trackingSite}
                  onChange={(e) => setTrackingSite(e.target.value)}
                  placeholder="https://www.delhivery.com/"
                />
              </div>

              <Button
                className="w-full"
                onClick={() =>
                  updateOrderMut.mutate({
                    id: editingOrder.id,
                    tracking: trackingId,
                    status: orderStatus,
                    site: trackingSite,
                  })
                }
                disabled={updateOrderMut.isPending}
              >
                {updateOrderMut.isPending ? "Updating Order…" : "Update Tracking & Status"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteProdId}
        onOpenChange={(o) => !o && setDeleteProdId(null)}
        title="Delete product?"
        consequence="This will permanently delete this item from the shop catalogue."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteProdId) deleteProdMut.mutate(deleteProdId);
        }}
      />
    </div>
  );
}
