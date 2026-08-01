import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ArrowLeft, Plus, X, ChevronDown, ChevronUp, Play, FileText, IndianRupee, Sparkles, Crown, Star, TrendingUp, Clock, Upload, Link as LinkIcon } from "lucide-react";
import { adminUpdateCourse, adminGetCourse } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin-dashboard/courses/$id")({
  loader: async ({ params }) => adminGetCourse(params.id),
  component: EditCoursePage,
});

const CATEGORIES = ["General", "AI/ML", "Web Development", "App Development", "Data Science", "Cybersecurity", "Cloud", "DevOps", "Electronics"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

interface CourseModule {
  title: string;
  description: string;
  videoUrl: string;
  notes: string;
  imageUrl: string;
  documentUrl: string;
}

const emptyModule = (): CourseModule => ({
  title: "",
  description: "",
  videoUrl: "",
  notes: "",
  imageUrl: "",
  documentUrl: "",
});

/** Convert a YouTube share/watch URL to an embeddable src */
function toYouTubeEmbed(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId = "";
    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v") ?? u.pathname.split("/").pop() ?? "";
    }
    if (!videoId) return null;
    const start = u.searchParams.get("t") ?? "";
    return `https://www.youtube.com/embed/${videoId}${start ? `?start=${start}` : ""}`;
  } catch {
    return null;
  }
}

/** Compress and convert image to Base64 Data URL */
const compressImage = (file: File, maxWidth = 1920): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(e.target?.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        // Use webp for better compression if available
        resolve(canvas.toDataURL("image/webp", 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/** Convert any file to Base64 (for PDFs/DOCs), with size limit */
const fileToBase64 = (file: File, maxSizeMB = 5): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return reject(new Error(`File is too large. Maximum size is ${maxSizeMB}MB to fit within database limits.`));
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function ModuleEditor({
  mod,
  index,
  onChange,
  onRemove,
}: {
  mod: CourseModule;
  index: number;
  onChange: (updated: CourseModule) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const embedSrc = toYouTubeEmbed(mod.videoUrl);

  const setField = (key: keyof CourseModule, value: string) =>
    onChange({ ...mod, [key]: value });

  const inputCls =
    "mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring";
  const labelCls = "mono text-[10px] uppercase tracking-widest text-ink-mute";

  return (
    <div className="rounded-xl border hairline bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-secondary/40 cursor-pointer select-none" onClick={() => setOpen(!open)}>
        <span className="mono text-[11px] text-ink-mute w-6 shrink-0">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex-1 text-[14px] font-medium truncate">
          {mod.title || <span className="text-ink-mute italic">Untitled module</span>}
        </span>
        <div className="flex items-center gap-2">
          {mod.videoUrl && <Play className="h-3.5 w-3.5 text-violet-500" />}
          {mod.notes && <FileText className="h-3.5 w-3.5 text-emerald-500" />}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="text-ink-mute hover:text-destructive ml-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {open ? <ChevronUp className="h-4 w-4 text-ink-mute" /> : <ChevronDown className="h-4 w-4 text-ink-mute" />}
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-4">
          {/* Module Title */}
          <div>
            <label className={labelCls}>Module Title *</label>
            <input
              required
              value={mod.title}
              onChange={(e) => setField("title", e.target.value)}
              className={inputCls}
              placeholder="e.g. Introduction to Neural Networks"
            />
          </div>

          {/* Module Description */}
          <div>
            <label className={labelCls}>Module Description</label>
            <textarea
              value={mod.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="What will learners learn in this module?"
            />
          </div>

          {/* YouTube Link */}
          <div>
            <label className={labelCls}>YouTube Video Link</label>
            <input
              value={mod.videoUrl}
              onChange={(e) => setField("videoUrl", e.target.value)}
              className={inputCls}
              placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
            />
            {embedSrc && (
              <div className="mt-3 overflow-hidden rounded-lg border hairline aspect-video bg-black/5">
                <iframe
                  src={embedSrc}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Preview: ${mod.title}`}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between">
              <label className={labelCls}>Notes / Study Material</label>
              <label className="cursor-pointer text-[11px] text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                <Upload className="h-3 w-3" />
                Attach PDF/Doc
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const base64 = await fileToBase64(file, 4); // 4MB max for DB safety
                        setField("documentUrl", base64);
                      } catch (err) {
                        alert((err as Error).message);
                      }
                    }
                  }}
                />
              </label>
            </div>
            
            <textarea
              value={mod.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={4}
              className={`${inputCls} resize-none font-mono text-[13px]`}
              placeholder="Add notes, key points, or markdown content for this module…"
            />

            {mod.documentUrl && (
              <div className="mt-2 flex items-center justify-between rounded-lg border hairline bg-emerald-50/50 px-3 py-2 text-[13px]">
                <div className="flex items-center gap-2 text-emerald-700">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium truncate max-w-[200px]">Document attached</span>
                </div>
                <button
                  type="button"
                  onClick={() => setField("documentUrl", "")}
                  className="text-emerald-700/60 hover:text-emerald-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Optional Image URL */}
          <div>
            <div className="flex items-center justify-between">
              <label className={labelCls}>Module Image URL (optional)</label>
              <label className="cursor-pointer text-[11px] text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                <Upload className="h-3 w-3" />
                Upload from PC
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const base64 = await compressImage(file, 1200);
                      setField("imageUrl", base64);
                    }
                  }}
                />
              </label>
            </div>
            <div className="relative mt-1.5">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mute" />
              <input
                value={mod.imageUrl}
                onChange={(e) => setField("imageUrl", e.target.value)}
                className={`${inputCls} pl-9`}
                placeholder="https://... or click Upload above"
              />
            </div>
            {mod.imageUrl && (
              <img
                src={mod.imageUrl}
                alt="Module preview"
                className="mt-2 h-28 rounded-lg object-cover border hairline bg-black/5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EditCoursePage() {
  const course = Route.useLoaderData() as any;
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(course.title || "");
  const [slug, setSlug] = useState(course.slug || "");
  const [shortDescription, setShortDescription] = useState(course.shortDescription || "");
  const [description, setDescription] = useState(course.description || "");
  const [category, setCategory] = useState(course.category || CATEGORIES[0]);
  const [level, setLevel] = useState(course.level || LEVELS[0]);
  const [duration, setDuration] = useState(course.duration || "");
  const [price, setPrice] = useState(String(course.price || 0));
  const [isFree, setIsFree] = useState(course.isFree ?? true);
  const [isPremium, setIsPremium] = useState(course.isPremium ?? false);
  const [isNew, setIsNew] = useState(course.isNew ?? true);
  const [isPopular, setIsPopular] = useState(course.isPopular ?? false);
  const [isComingSoon, setIsComingSoon] = useState(course.isComingSoon ?? false);
  const [status, setStatus] = useState(course.status || "draft");
  const [bannerUrl, setBannerUrl] = useState(course.bannerUrl || "");
  const [roadmap, setRoadmap] = useState<CourseModule[]>(course.roadmap && course.roadmap.length > 0 ? course.roadmap : [emptyModule()]);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminUpdateCourse({
        data: {
          id: course.id,
          title,
          slug: slug || autoSlug(title),
          shortDescription,
          description,
          category,
          level,
          duration,
          price: isFree ? 0 : Number(price),
          isFree,
          isPremium,
          isNew,
          isPopular,
          isComingSoon,
          bannerUrl,
          status,
          roadmap,
        },
      });
      navigate({ to: "/admin-dashboard/courses" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => setRoadmap((m) => [...m, emptyModule()]);
  const updateModule = (i: number, updated: CourseModule) =>
    setRoadmap((m) => m.map((mod, idx) => (idx === i ? updated : mod)));
  const removeModule = (i: number) => setRoadmap((m) => m.filter((_, idx) => idx !== i));

  const inputCls = "mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring";
  const labelCls = "mono text-[10px] uppercase tracking-widest text-ink-mute";

  return (
    <div className="px-8 py-10">
      <button
        onClick={() => navigate({ to: "/admin-dashboard/courses" })}
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-mute hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
      </button>

      <div className="mt-4 border-b hairline pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Course</h1>
        <p className="mt-1 text-[13.5px] text-ink-mute">Update course details and content.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-7">
        {/* ── Basic Info ── */}
        <section className="space-y-5">
          <p className="text-[11px] mono uppercase tracking-widest text-ink-mute border-b hairline pb-2">Basic Info</p>

          {/* Title + Slug */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Title *</label>
              <input
                required value={title}
                onChange={(e) => { setTitle(e.target.value); setSlug(autoSlug(e.target.value)); }}
                className={inputCls}
                placeholder="Introduction to AI"
              />
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input
                required value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={`${inputCls} font-mono`}
                placeholder="intro-to-ai"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className={labelCls}>Short Description</label>
            <input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className={inputCls}
              placeholder="One-line summary shown on the course card"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className={labelCls}>Full Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Detailed description of the course…"
            />
          </div>

          {/* Banner URL */}
          <div>
            <div className="flex items-center justify-between">
              <label className={labelCls}>Banner Image URL (1920×1080)</label>
              <label className="cursor-pointer text-[12px] text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                <Upload className="h-3.5 w-3.5" />
                Upload from PC
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const base64 = await compressImage(file, 1920);
                      setBannerUrl(base64);
                    }
                  }}
                />
              </label>
            </div>
            <div className="relative mt-1.5">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mute" />
              <input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)}
                className={`${inputCls} pl-9`}
                placeholder="Paste public URL or click Upload" />
            </div>
            {bannerUrl && (
              <img
                src={bannerUrl}
                alt="Banner preview"
                className="mt-2 w-full max-h-48 object-cover rounded-lg border hairline bg-black/5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>

          {/* Category + Level + Duration */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Duration</label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)}
                className={inputCls} placeholder="e.g. 8 weeks" />
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="space-y-4">
          <p className="text-[11px] mono uppercase tracking-widest text-ink-mute border-b hairline pb-2">Pricing</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setIsFree(true); setIsPremium(false); setPrice("0"); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[14px] font-medium transition-all ${isFree ? "border-violet-500 bg-violet-50 text-violet-700" : "border-input hover:border-ink/30"}`}
            >
              <Sparkles className="h-4 w-4" /> Free
            </button>
            <button
              type="button"
              onClick={() => { setIsFree(false); setIsPremium(true); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[14px] font-medium transition-all ${!isFree ? "border-amber-500 bg-amber-50 text-amber-700" : "border-input hover:border-ink/30"}`}
            >
              <Crown className="h-4 w-4" /> Paid
            </button>
          </div>

          {!isFree && (
            <div>
              <label className={labelCls}>Price (₹)</label>
              <div className="relative mt-1.5">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mute" />
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`${inputCls} pl-9`}
                  placeholder="999"
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Badges ── */}
        <section className="space-y-3">
          <p className="text-[11px] mono uppercase tracking-widest text-ink-mute border-b hairline pb-2">Badges & Visibility</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { key: isNew, set: setIsNew, label: "New", icon: Star, color: "bg-blue-50 border-blue-300 text-blue-700" },
              { key: isPopular, set: setIsPopular, label: "Popular", icon: TrendingUp, color: "bg-orange-50 border-orange-300 text-orange-700" },
              { key: isComingSoon, set: setIsComingSoon, label: "Coming Soon", icon: Clock, color: "bg-slate-50 border-slate-300 text-slate-600" },
            ].map(({ key, set, label, icon: Icon, color }, i) => (
              <button
                key={i}
                type="button"
                onClick={() => set(!key)}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-[13px] font-medium transition-all ${
                  key
                    ? `border-current ${color}`
                    : "border-input hover:border-ink/30"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Modules / Roadmap ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b hairline pb-2">
            <p className="text-[11px] mono uppercase tracking-widest text-ink-mute">Course Modules</p>
            <span className="mono text-[11px] text-ink-mute">{roadmap.length} module{roadmap.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="space-y-3">
            {roadmap.map((mod, i) => (
              <ModuleEditor
                key={i}
                mod={mod}
                index={i}
                onChange={(updated) => updateModule(i, updated)}
                onRemove={() => removeModule(i)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addModule}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/20 py-3 text-[13.5px] text-ink-mute hover:border-ink/40 hover:text-ink transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Module
          </button>
        </section>

        {/* ── Status ── */}
        <section className="space-y-3">
          <p className="text-[11px] mono uppercase tracking-widest text-ink-mute border-b hairline pb-2">Status</p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputCls}
          >
            <option value="draft">Draft — not publicly visible</option>
            <option value="published">Published — visible to all learners</option>
          </select>
        </section>

        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-[13px] text-destructive">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/admin-dashboard/courses" })}
            className="rounded-full border hairline px-6 py-2.5 text-[13.5px] hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[13.5px] text-paper hover:bg-ink/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
