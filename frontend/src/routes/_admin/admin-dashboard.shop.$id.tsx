import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ArrowLeft, X, Upload, Save, Star } from "lucide-react";
import { adminUpdateProduct } from "@/lib/admin.functions";

const CATEGORIES = ["Diary", "T-Shirt", "Pen", "Sticker", "Cup", "Key Chain", "Other"];

async function loadProduct(id: string) {
  const { firebaseAuth } = await import("@/integrations/firebase/client");
  const token = await firebaseAuth.currentUser?.getIdToken();
  const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const product = data.find((p: any) => p.id === id);
  if (!product) throw new Error("Product not found");
  return product;
}

export const Route = createFileRoute("/_admin/admin-dashboard/shop/$id")({
  loader: ({ params }) => loadProduct(params.id),
  component: EditProductPage,
});

const compressImage = (file: File, maxWidth = 1920): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) { height = (maxWidth * height) / width; width = maxWidth; }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(e.target?.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function EditProductPage() {
  const { id } = Route.useParams();
  const product = Route.useLoaderData() as any;
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>(product.images || []);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [form, setForm] = useState({
    name: product.name || "",
    slug: product.slug || "",
    shortDescription: product.shortDescription || "",
    description: product.description || "",
    price: String(product.price || ""),
    discountedPrice: String(product.discountedPrice || ""),
    category: product.category || "Diary",
    status: (product.status || "draft") as "draft" | "published",
  });

  const inputCls = "mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring";
  const labelCls = "mono text-[10px] uppercase tracking-widest text-ink-mute";

  const setField = (key: keyof typeof form, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImg(true);
    try {
      const results = await Promise.all(files.map((f) => compressImage(f)));
      setImages((prev) => [...prev, ...results].slice(0, 6));
    } catch { alert("Failed to process image."); }
    finally { setUploadingImg(false); e.target.value = ""; }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateProduct({
        data: {
          id,
          ...form,
          price: Number(form.price),
          discountedPrice: Number(form.discountedPrice),
          images,
        },
      });
      navigate({ to: "/admin-dashboard/shop" });
    } catch (err: any) {
      alert(err.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-8 py-10 max-w-3xl">
      <button onClick={() => navigate({ to: "/admin-dashboard/shop" })} className="inline-flex items-center gap-1.5 text-[13px] text-ink-mute hover:text-ink mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
      </button>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div>
          <label className={labelCls}>Product Images (max 6)</label>
          <div className="mt-2 flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative h-24 w-24 rounded-lg overflow-hidden border hairline">
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
                {idx === 0 && <span className="absolute bottom-1 left-1 rounded text-[9px] font-medium bg-black/60 text-white px-1">Cover</span>}
              </div>
            ))}
            {images.length < 6 && (
              <label className="h-24 w-24 rounded-lg border-2 border-dashed hairline flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/40 text-ink-mute">
                {uploadingImg ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5" /><span className="text-[10px] mt-1">Upload</span></>}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls}>Product Name *</label>
          <input required value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Slug (URL)</label>
          <input value={form.slug} onChange={(e) => setField("slug", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Category *</label>
          <select value={form.category} onChange={(e) => setField("category", e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Short Description</label>
          <input value={form.shortDescription} onChange={(e) => setField("shortDescription", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Full Description</label>
          <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={5} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Original Price (₹) *</label>
            <input required type="number" min="0" value={form.price} onChange={(e) => setField("price", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Discounted Price (₹) *</label>
            <input required type="number" min="0" value={form.discountedPrice} onChange={(e) => setField("discountedPrice", e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <div className="flex gap-3 mt-2">
            {(["draft", "published"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setField("status", s)} className={`rounded-full px-4 py-1.5 text-[13px] font-medium border transition-colors ${form.status === s ? "bg-ink text-paper border-ink" : "bg-transparent text-ink-soft border-input hover:bg-secondary"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[13.5px] font-medium text-paper hover:bg-ink/90 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
          <button type="button" onClick={() => navigate({ to: "/admin-dashboard/shop" })} className="rounded-full px-6 py-2.5 text-[13.5px] font-medium border hairline text-ink-soft hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
