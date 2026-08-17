"use client";
import Link from 'next/link';
import { useQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { ArrowRight, Clock, Layers, ArrowLeft, Search } from "lucide-react";
import { listPublishedCourses } from "@/lib/courses.functions";

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  category: string;
  level: string;
  duration?: string | null;
  price: number;
  isFree: boolean;
  isPremium: boolean;
  isNew: boolean;
  isPopular: boolean;
  isComingSoon: boolean;
  bannerUrl?: string | null;
}

const coursesQueryOptions = queryOptions({
  queryKey: ["courses", "published"],
  queryFn: () => listPublishedCourses(),
  staleTime: 1000 * 60 * 5
});



/* ── Tag colours ────────────────────────────────────────── */
const levelStyle = (level: string): React.CSSProperties => {
  if (!level) return {};
  const map: Record<string, React.CSSProperties> = {
    "Beginner": { background: "var(--tertiary)", color: "var(--ink)" },
    "Intermediate": { background: "var(--amber)", color: "var(--ink)" },
    "Advanced": { background: "var(--ink)", color: "#FFF9ED" },
    "All levels": { background: "rgba(21,23,28,0.06)", color: "var(--ink)" },
  };
  return map[level] ?? { background: "rgba(21,23,28,0.06)", color: "var(--ink)" };
};

function SkeletonCard() {
  return (
    <div className="glass-shell">
      <div className="glass-card flex flex-col p-0 overflow-hidden" style={{ borderRadius: "23px" }}>
        <div className="aspect-[16/10] animate-pulse" style={{ background: "rgba(21,23,28,0.05)" }} />
        <div className="flex flex-1 flex-col p-5 space-y-3">
          <div className="h-2.5 w-1/3 animate-pulse rounded-full" style={{ background: "rgba(21,23,28,0.07)" }} />
          <div className="h-5 w-3/4 animate-pulse rounded-full" style={{ background: "rgba(21,23,28,0.07)" }} />
          <div className="h-3 w-full animate-pulse rounded-full" style={{ background: "rgba(21,23,28,0.05)" }} />
          <div className="h-3 w-2/3 animate-pulse rounded-full" style={{ background: "rgba(21,23,28,0.05)" }} />
        </div>
      </div>
    </div>
  );
}

const TYPES = ["All", "Free", "Premium"];

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useQuery(coursesQueryOptions);
  
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");

  const filtered = useMemo(() => {
    const list = Array.isArray(courses) ? courses : [];
    return (list as CourseItem[]).filter((c) => {
      if (!c) return false;
      const title = (c.title || "").toLowerCase();
      const category = (c.category || "").toLowerCase();
      const query = search.toLowerCase();
      const matchesSearch = title.includes(query) || category.includes(query);

      const isFree = c.isFree || c.price === 0 || (c as any).discountedPrice === 0;
      const isPremium = c.isPremium || (!isFree && ((c.price && c.price > 0) || ((c as any).discountedPrice && (c as any).discountedPrice > 0)));

      let matchesType = true;
      if (activeType === "Free") matchesType = Boolean(isFree);
      if (activeType === "Premium") matchesType = Boolean(isPremium);

      return matchesSearch && matchesType;
    });
  }, [courses, search, activeType]);

  return (
    <main className="relative min-h-screen" style={{ background: "#FFFFFF" }}>

      {/* Amber haze at top */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "500px", pointerEvents: "none",
        background: "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.42) 0%, rgba(255,248,234,0.14) 55%, transparent 80%)"
      }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.05 }} />

      {/* ── Hero header ─────────────────────────────────── */}
      <section className="relative px-6 pb-20 pt-24 md:px-10" style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}>
        {/* Back link */}
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] transition-colors" style={{ color: "var(--ink-mute)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>

        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="eyebrow">— Curriculum</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="display mt-3 max-w-2xl text-5xl md:text-6xl"
                style={{ color: "var(--ink)" }}
              >
                Learn by <span className="italic-serif" style={{ color: "#B8922E" }}>building</span>.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.10, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 max-w-xl text-[15px] leading-relaxed"
                style={{ color: "var(--ink-soft)" }}
              >
                Cohort-based courses designed for engineers. Theory is kept short; the majority
                of your time is spent writing, reviewing and shipping real code.
              </motion.p>
            </div>

            {/* Stats pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="flex items-center gap-3 rounded-full px-4 py-2"
              style={{ background: "var(--amber)", border: "0.8px solid rgba(21,23,28,0.10)" }}
            >
              <Search className="h-3.5 w-3.5" style={{ color: "var(--ink)" }} />
              <span className="mono text-[11px] font-bold" style={{ color: "var(--ink)" }}>
                {filtered.length} course{filtered.length !== 1 ? "s" : ""} · v2026.1
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="sticky top-0 z-20 px-6 py-4 md:px-10" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "0.8px solid rgba(21,23,28,0.06)" }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors ${activeType === type ? "bg-ink text-paper" : "bg-paper shadow-sm hover:bg-paper-dark"}`}
                style={activeType !== type ? { color: "var(--ink-soft)", border: "0.8px solid rgba(21,23,28,0.08)" } : undefined}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--ink-mute)" }} />
            <input
              type="text"
              placeholder="Search title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full bg-paper py-2 pl-9 pr-4 text-[13px] shadow-sm outline-none placeholder:text-ink-mute/60 focus:ring-1 focus:ring-ring"
              style={{ color: "var(--ink)", border: "0.8px solid rgba(21,23,28,0.08)" }}
            />
          </div>
        </div>
      </section>

      {/* ── Course grid ─────────────────────────────────── */}
      <section className="relative px-6 py-14 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          {filtered.length === 0 ? (
            <div className="glass-shell mx-auto max-w-sm text-center">
              <div className="glass-card" style={{ borderRadius: "23px" }}>
                <Layers className="mx-auto h-10 w-10 opacity-30" style={{ color: "var(--ink)" }} />
                <p className="mt-4 text-[14px]" style={{ color: "var(--ink-soft)" }}>No courses found for this criteria.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course, i) => (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-shell group"
                >
                  <div
                    className="glass-card flex flex-col overflow-hidden p-0 transition-all group-hover:-translate-y-1"
                    style={{ borderRadius: "23px" }}
                  >
                    {/* Minimalist Top Surface */}
                    <div className="relative aspect-[16/9] flex items-center justify-center overflow-hidden" style={{ borderRadius: "23px 23px 0 0", background: "var(--amber-soft)", borderBottom: "0.8px solid rgba(21,23,28,0.06)" }}>
                      <div className="grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110" style={{ background: "rgba(255,255,255,0.85)", border: "0.8px solid rgba(21,23,28,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <Layers className="h-6 w-6" style={{ color: "var(--ink)", opacity: 0.6 }} />
                      </div>
                      {/* Level badge */}
                      <div
                        className="absolute left-3.5 top-3.5 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider shadow-sm"
                        style={{ ...levelStyle(course.level), backdropFilter: "blur(8px)" }}
                      >
                        {course.level}
                      </div>
                      {/* Free tag */}
                      {course.isFree && (
                        <div className="absolute right-3.5 top-3.5 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider shadow-sm" style={{ background: "var(--tertiary)", color: "var(--ink)" }}>
                          Free
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mono flex items-center gap-2 text-[10.5px]" style={{ color: "var(--ink-mute)" }}>
                        <span className="uppercase tracking-wider">{course.duration}</span>
                        <span className="opacity-40">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.category}
                        </span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                        {course.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                        {course.shortDescription}
                      </p>

                      {/* Footer */}
                      <div className="mt-auto mt-5 flex items-center justify-between pt-4" style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)" }}>
                        <span className="text-[15px] font-bold" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                          {formatPrice(course.price, course.isFree)}
                        </span>
                        <Link href={`/courses/${course.slug}`}
                          className="group/link inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-all hover:-translate-y-px"
                          style={{ background: "var(--ink)", color: "#FFF9ED", border: "0.8px solid rgba(255,232,184,0.20)" }}
                        >
                          View course
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function formatPrice(cents: number, isFree: boolean): string {
  if (isFree || cents <= 0) return "Free";
  const value = cents / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
