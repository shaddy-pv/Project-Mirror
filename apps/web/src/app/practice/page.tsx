"use client";
import Link from 'next/link';
import { useQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, Search, Code, BrainCircuit, Play } from "lucide-react";
import { getPracticeTests } from "@/lib/practice.functions";
import { useState, useMemo } from "react";

interface PracticeTest {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  questionsCount: number;
  timeLimitMinutes: number;
  createdAt: string;
}

const practiceQueryOptions = queryOptions({
  queryKey: ["practice_tests"],
  queryFn: () => getPracticeTests()
});

export default function PracticePage() {
  const { data: tests = [], isLoading } = useQuery(practiceQueryOptions);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = Array.isArray(tests) ? tests : [];
    return (list as PracticeTest[]).filter((t) => {
      if (!t) return false;
      const title = (t.title || "").toLowerCase();
      const subject = (t.subject || "").toLowerCase();
      const query = search.toLowerCase();
      return title.includes(query) || subject.includes(query);
    });
  }, [tests, search]);

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
                <span className="eyebrow">— Skill Assessment</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="display mt-3 max-w-2xl text-5xl md:text-6xl"
                style={{ color: "var(--ink)" }}>
                Practice <span className="italic-serif" style={{ color: "#B8922E" }}>Center</span>.
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-6 max-w-lg text-[15px] leading-relaxed md:text-[17px]" style={{ color: "var(--ink-soft)" }}>
                Sharpen your skills and prepare for your next opportunity with our unproctored mock tests and subject quizzes.
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--ink-mute)" }} />
              <input
                type="text"
                placeholder="Search tests or subjects..."
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
                <BrainCircuit className="mx-auto h-10 w-10 opacity-30" style={{ color: "var(--ink)" }} />
                <p className="mt-4 text-[14px]" style={{ color: "var(--ink-soft)" }}>No practice tests found.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-shell group"
                >
                  <div className="glass-card flex h-full flex-col p-6 transition-all hover:bg-ink/[0.02]" style={{ borderRadius: "23px" }}>
                    
                    <div className="mb-4 inline-flex w-max items-center justify-center rounded-2xl bg-indigo-50 p-3 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                      <Code className="h-6 w-6" />
                    </div>

                    {item.subject && (
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-mute">
                        {item.subject}
                      </div>
                    )}
                    
                    <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                      {item.title}
                    </h2>
                    
                    {item.description && (
                      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-6 flex items-center gap-4 border-t border-ink/5 pt-4 text-[12px] font-medium text-ink-mute">
                      <span>{item.questionsCount} Questions</span>
                      <span>•</span>
                      <span>{item.timeLimitMinutes} Mins</span>
                    </div>

                    <div className="mt-6 pt-2">
                      <button 
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-paper transition-transform hover:scale-[1.02]"
                      >
                        <Play className="h-4 w-4" /> Start Practice
                      </button>
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
