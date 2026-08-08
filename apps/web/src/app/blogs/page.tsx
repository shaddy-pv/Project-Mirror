"use client";
import Link from 'next/link';
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, Search, Calendar, User, FileText, ArrowRight } from "lucide-react";
import { getBlogs } from "@/lib/blogs.functions";
import { useState, useMemo } from "react";

interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  banner?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

const blogsQueryOptions = queryOptions({
  queryKey: ["blogs"],
  queryFn: () => getBlogs()
});

export default function BlogsPage() {
  const { data: blogs } = useSuspenseQuery(blogsQueryOptions);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return (blogs as BlogItem[]).filter((b) => 
      b.title.toLowerCase().includes(search.toLowerCase()) || 
      b.excerpt?.toLowerCase().includes(search.toLowerCase())
    );
  }, [blogs, search]);

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
                <span className="eyebrow">— Thoughts & Insights</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="display mt-3 max-w-2xl text-5xl md:text-6xl"
                style={{ color: "var(--ink)" }}>
                Enginow <span className="italic-serif" style={{ color: "#B8922E" }}>Blogs</span>.
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-6 max-w-lg text-[15px] leading-relaxed md:text-[17px]" style={{ color: "var(--ink-soft)" }}>
                Discover our latest insights on technology, development, and the future of engineering.
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--ink-mute)" }} />
              <input
                type="text"
                placeholder="Search articles..."
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
                <FileText className="mx-auto h-10 w-10 opacity-30" style={{ color: "var(--ink)" }} />
                <p className="mt-4 text-[14px]" style={{ color: "var(--ink-soft)" }}>No articles found.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, i) => (
                <Link key={item.id} href={`/blogs/${item.id}`} className="group block h-full">
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-shell h-full"
                  >
                    <div className="glass-card flex h-full flex-col overflow-hidden transition-all group-hover:-translate-y-1" style={{ borderRadius: "23px" }}>
                      
                      {item.banner && (
                        <div className="relative h-48 w-full overflow-hidden bg-ink/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.banner} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-ink-mute">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <h2 className="mt-4 text-xl font-bold leading-tight tracking-tight transition-colors group-hover:text-amber-700" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                          {item.title}
                        </h2>
                        
                        <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                          {item.excerpt}
                        </p>
                        
                        <div className="mt-auto pt-6 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[12.5px] font-medium" style={{ color: "var(--ink-soft)" }}>
                            <User className="h-4 w-4 rounded-full bg-ink/10 p-0.5" /> Author
                          </div>
                          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ink transition-transform group-hover:translate-x-1">
                            Read more <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
