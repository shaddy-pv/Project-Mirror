"use client";
import Link from 'next/link';
import { useQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, Search, FileDown, BookOpen } from "lucide-react";
import { getResources } from "@/lib/resources.functions";
import { useState, useMemo } from "react";

interface ResourceItem {
  id: string;
  title: string;
  description?: string;
  pdfUrl: string;
  category?: string;
  createdAt: string;
}

const resourcesQueryOptions = queryOptions({
  queryKey: ["resources"],
  queryFn: () => getResources()
});

export default function ResourcesPage() {
  const { data: resources = [], isLoading } = useQuery(resourcesQueryOptions);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = Array.isArray(resources) ? resources : [];
    return (list as ResourceItem[]).filter((r) => {
      if (!r) return false;
      const title = (r.title || "").toLowerCase();
      const category = (r.category || "").toLowerCase();
      const query = search.toLowerCase();
      return title.includes(query) || category.includes(query);
    });
  }, [resources, search]);

  return (
    <main className="relative min-h-screen" style={{ background: "#FFFFFF" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.05 }} />

      <section className="relative px-6 pb-20 pt-24 md:px-10" style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}>
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] transition-colors" style={{ color: "var(--ink-mute)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>

        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
                <span className="eyebrow">— Downloads & Materials</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="display mt-3 max-w-2xl text-5xl md:text-6xl"
                style={{ color: "var(--ink)" }}>
                Learning <span className="italic-serif" style={{ color: "#B8922E" }}>Resources</span>.
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-6 max-w-lg text-[15px] leading-relaxed md:text-[17px]" style={{ color: "var(--ink-soft)" }}>
                Access our curated collection of notes, PDF materials, and reference documents created by our educators.
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--ink-mute)" }} />
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full bg-paper py-2.5 pl-9 pr-4 text-[13px] shadow-sm outline-none placeholder:text-ink-mute/60 focus:ring-1 focus:ring-ring"
                style={{ color: "var(--ink)", border: "0.8px solid rgba(21,23,28,0.08)" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-14 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          {filtered.length === 0 ? (
            <div className="glass-shell mx-auto max-w-sm text-center">
              <div className="glass-card" style={{ borderRadius: "23px" }}>
                <BookOpen className="mx-auto h-10 w-10 opacity-30" style={{ color: "var(--ink)" }} />
                <p className="mt-4 text-[14px]" style={{ color: "var(--ink-soft)" }}>No resources found.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-shell group"
                >
                  <div className="glass-card flex h-full flex-col p-6 transition-all hover:bg-ink/[0.02]" style={{ borderRadius: "23px" }}>
                    
                    <div className="mb-4 inline-flex w-max items-center justify-center rounded-2xl bg-amber-50 p-4 text-amber-600 transition-colors group-hover:bg-amber-100">
                      <FileDown className="h-8 w-8" />
                    </div>

                    {item.category && (
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-mute">
                        {item.category}
                      </div>
                    )}
                    
                    <h2 className="text-[17px] font-bold leading-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                      {item.title}
                    </h2>
                    
                    {item.description && (
                      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-auto pt-6">
                      <a 
                        href={item.pdfUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 bg-transparent px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-ink/5"
                      >
                        <FileDown className="h-4 w-4" /> Download PDF
                      </a>
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
