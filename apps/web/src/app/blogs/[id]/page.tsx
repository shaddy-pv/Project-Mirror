"use client";
import React, { use } from 'react';
import Link from 'next/link';
import { useQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft, Calendar, User, Share2, Bookmark, Loader2 } from "lucide-react";
import { getBlogById } from "@/lib/blogs.functions";
import { motion } from "motion/react";
import { notFound } from "next/navigation";

const blogQueryOptions = (id: string) => queryOptions({
  queryKey: ["blog", id],
  queryFn: () => getBlogById(id)
});

export default function BlogReaderPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { data: blog, isLoading } = useQuery(blogQueryOptions(params.id));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#15171C]" />
      </div>
    );
  }

  if (!blog) return notFound();

  return (
    <main className="relative min-h-screen pb-20" style={{ background: "#FFFFFF" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.05 }} />

      <section className="relative px-6 pt-24 md:px-10">
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link href="/blogs" className="inline-flex items-center gap-1.5 text-[13px] transition-colors hover:text-ink" style={{ color: "var(--ink-mute)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to blogs
          </Link>
        </div>

        <article className="mx-auto max-w-3xl pt-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-6 flex items-center gap-4 text-[12px] font-medium uppercase tracking-widest text-ink-mute">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Author</span>
            </div>

            <h1 className="display text-4xl md:text-5xl lg:text-6xl" style={{ color: "var(--ink)" }}>
              {blog.title}
            </h1>
            
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">
              {blog.excerpt}
            </p>

            <div className="mt-8 flex items-center gap-3 border-y border-ink/5 py-4">
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink">
                <Bookmark className="h-4 w-4" /> Save
              </button>
            </div>
          </motion.div>

          {blog.banner && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-10 overflow-hidden rounded-3xl bg-ink/5 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={blog.banner} alt={blog.title} className="w-full object-cover" />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="prose prose-lg prose-slate mt-12 max-w-none text-ink-soft prose-headings:font-bold prose-headings:text-ink prose-a:text-amber-600 prose-pre:bg-ink/5 prose-pre:text-ink"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </section>
    </main>
  );
}
