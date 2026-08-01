import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { getPublishedProducts } from "@/lib/shop.functions";
import { ShoppingBag, Star, ArrowLeft, Search } from "lucide-react";

export const Route = createFileRoute("/shop/")({
  loader: () => getPublishedProducts(),
  head: () => ({
    meta: [
      { title: "Shop — Enginow" },
      { name: "description", content: "Browse Enginow merchandise — diaries, T-shirts, stickers, and more." },
    ],
  }),
  component: ShopIndexPage,
});

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: number;
  discountedPrice: number;
  images: string[];
  rating: number;
  category: string;
};

const CATEGORY_FILTERS = ["All", "Diary", "T-Shirt", "Pen", "Sticker", "Cup", "Key Chain", "Other"];

function ShopIndexPage() {
  const products = (Route.useLoaderData() as unknown as Product[]) || [];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.shortDescription || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <main className="relative min-h-screen" style={{ background: "#FFFFFF" }}>
      {/* Amber haze */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "500px", pointerEvents: "none",
          background: "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.38) 0%, rgba(255,248,234,0.12) 55%, transparent 80%)",
        }}
      />

      {/* Hero header */}
      <section className="relative px-6 pb-20 pt-24 md:px-10" style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}>
        {/* Back link */}
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] transition-colors" style={{ color: "var(--ink-mute)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>

        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">— ENGINOW SHOP</span>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="display mt-3 max-w-2xl text-5xl md:text-6xl" style={{ color: "var(--ink)" }}>
                Our <span className="italic-serif" style={{ color: "#B8922E" }}>Collection.</span>
              </motion.h1>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                Diaries, T-shirts, stickers and more — carry a piece of Enginow with you.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: "rgba(200,168,75,0.25)", color: "var(--ink)" }}>
                <ShoppingBag className="h-3.5 w-3.5" /> {products.length} products
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Filters & Search */}
      <div className="sticky top-0 z-20 border-b px-6 py-4 md:px-10" style={{ borderColor: "rgba(21,23,28,0.08)", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-all"
                style={{
                  background: category === cat ? "rgba(21,23,28,0.05)" : "transparent",
                  color: category === cat ? "var(--ink)" : "var(--ink-soft)",
                  border: `0.8px solid ${category === cat ? "rgba(21,23,28,0.08)" : "transparent"}`
                }}
              >
                {cat === "All" ? "All products" : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--ink-mute)" }} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border px-9 py-2 text-[13.5px] outline-none transition-all placeholder:text-ink-mute"
              style={{
                background: "rgba(255,255,255,0.9)",
                borderColor: "rgba(21,23,28,0.08)",
                color: "var(--ink)"
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag className="h-10 w-10 text-ink-mute/40 mb-4" />
              <p className="text-lg font-medium text-ink-soft">No products found</p>
              <p className="mt-1 text-[13px] text-ink-mute">Try a different search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const discountPct = product.price > 0
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to="/shop/$slug" params={{ slug: product.slug }} className="group block">
        {/* Image */}
        <div className="relative overflow-hidden rounded-xl aspect-square bg-secondary/40 border hairline">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-ink-mute/40" />
            </div>
          )}
          {discountPct > 0 && (
            <div className="absolute top-2 left-2 rounded-full bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5">
              -{discountPct}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5">
          <p className="text-[11px] font-medium text-ink-mute uppercase tracking-wider">{product.category}</p>
          <h3 className="mt-0.5 text-[14px] font-semibold text-ink leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="mt-1 text-[12px] text-ink-mute line-clamp-1">{product.shortDescription}</p>
          )}

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[12px] text-ink-soft font-medium">{product.rating.toFixed(1)}</span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[15px] font-bold text-ink">₹{product.discountedPrice}</span>
            {product.price > product.discountedPrice && (
              <span className="text-[12px] text-ink-mute line-through">₹{product.price}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
