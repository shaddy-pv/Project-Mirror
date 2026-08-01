import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Plus, Loader2, Trash2, Edit2, Eye, Package } from "lucide-react";
import { adminListProducts, adminDeleteProduct } from "@/lib/admin.functions";
import { useState } from "react";

export const Route = createFileRoute("/_admin/admin-dashboard/shop/")({
  loader: () => adminListProducts(),
  component: AdminShop,
});

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  discountedPrice: number;
  rating: number;
  status: string;
  images: string[];
};

function AdminShop() {
  const initial = Route.useLoaderData() as unknown as ProductRow[];
  const [prods, setProds] = useState<ProductRow[]>(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await adminDeleteProduct({ data: { id } });
      setProds((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shop Products</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            {prods.length} product{prods.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          to="/admin-dashboard/shop/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-paper hover:bg-ink/90"
        >
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      <div className="mt-8">
        {prods.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline py-20 text-center">
            <Package className="h-10 w-10 text-ink-mute mb-3" />
            <p className="font-medium">No products yet</p>
            <p className="mt-1 text-[13px] text-ink-soft">Click "New Product" to add your first item.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border hairline">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b hairline bg-secondary/40">
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Discounted</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Rating</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-soft">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prods.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b hairline last:border-0 hover:bg-secondary/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover border hairline shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-ink-mute" />
                          </div>
                        )}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{p.category}</td>
                    <td className="px-4 py-3 text-ink-soft line-through">₹{p.price}</td>
                    <td className="px-4 py-3 font-medium text-emerald-600">₹{p.discountedPrice}</td>
                    <td className="px-4 py-3">
                      <span className="text-amber-500">★</span> {p.rating}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          p.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/shop/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md p-1.5 text-ink-mute hover:bg-secondary hover:text-ink"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <Link
                          to="/admin-dashboard/shop/$id"
                          params={{ id: p.id }}
                          className="rounded-md p-1.5 text-ink-mute hover:bg-secondary hover:text-ink"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="rounded-md p-1.5 text-ink-mute hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          {deletingId === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
