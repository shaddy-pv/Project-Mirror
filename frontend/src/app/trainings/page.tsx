import  createFileRoute, , useRouter from 'next/link';
import { useSuspenseQuery, queryOptions, useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Search, Layers, CheckCircle2, ArrowRight, Share2 } from "lucide-react";
import { listPublishedTrainings } from "@/lib/trainings.functions";
import { useAuthContext } from "@/routes/__root";
import { getMyProfile } from "@/lib/courses.functions";

interface TrainingItem {
  id: string;
  slug: string;
  title: string;
  youWillLearn: string[];
  originalPrice: number;
  discountedPrice: number;
  bannerUrl?: string;
}

const trainingsQueryOptions = queryOptions({
  queryKey: ["trainings", "published"],
  queryFn: () => listPublishedTrainings(),
  staleTime: 1000 * 60 * 5,
});

,
});

export default function TrainingsPage() {
  const { data: trainings } = useSuspenseQuery(trainingsQueryOptions);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return (trainings as TrainingItem[]).filter((t) => {
      const query = search.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(query);
      const matchesSkills = t.youWillLearn.some(skill => skill.toLowerCase().includes(query));
      return matchesTitle || matchesSkills;
    });
  }, [trainings, search]);

  const auth = useAuthContext();
  const router = useRouter();
  
  const { data: myProfile } = useQuery({
    queryKey: ["myProfile", auth.user?.uid],
    queryFn: () => getMyProfile(),
    enabled: auth.isAuthenticated,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // If someone visits with ?ref=XYZ, save it globally
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("enginow_ref", ref);
      // Clean URL silently
      searchParams.delete("ref");
      const newUrl = window.location.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const handleShare = (trainingId: string) => {
    let url = `${window.location.origin}/trainings`;
    const canRefer = auth.isAuthenticated && myProfile?.referralCode && !myProfile?.referralExpired;
    if (canRefer) url += `?ref=${myProfile.referralCode}`;
    navigator.clipboard.writeText(url).then(() => { 
      setCopiedId(trainingId); 
      setTimeout(() => setCopiedId(null), 2500); 
    });
  };

  return (
    <main className="relative min-h-screen" style={{ background: "#FFFFFF" }}>
      {/* Amber haze header */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "450px", pointerEvents: "none",
        background: "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.35) 0%, rgba(255,248,234,0.1) 60%, transparent 80%)"
      }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.05 }} />

      {/* Hero */}
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
                <span className="eyebrow">— Programs</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="display mt-3 max-w-2xl text-5xl md:text-6xl"
                style={{ color: "var(--ink)" }}
              >
                Intensive <span className="italic-serif" style={{ color: "#B8922E" }}>training</span>.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.10, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 max-w-xl text-[15px] leading-relaxed"
                style={{ color: "var(--ink-soft)" }}
              >
                Get industry-ready with focused, practical training programs. Build real-world projects and master in-demand technical stacks.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.15 }}
              className="flex items-center gap-3 rounded-full px-4 py-2"
              style={{ background: "var(--amber)", border: "0.8px solid rgba(21,23,28,0.10)" }}
            >
              <Search className="h-3.5 w-3.5" style={{ color: "var(--ink)" }} />
              <span className="mono text-[11px] font-bold" style={{ color: "var(--ink)" }}>
                {filtered.length} program{filtered.length !== 1 ? "s" : ""}
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="sticky top-0 z-20 px-6 py-4 md:px-10" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "0.8px solid rgba(21,23,28,0.06)" }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 text-[12px] font-medium" style={{ color: "var(--ink-soft)" }}>
            <span className="rounded-full px-3 py-1.5" style={{ background: "rgba(21,23,28,0.04)" }}>All programs are premium/paid</span>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--ink-mute)" }} />
            <input
              type="text"
              placeholder="Search by title or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full bg-paper py-2 pl-9 pr-4 text-[13px] shadow-sm outline-none placeholder:text-ink-mute/60 focus:ring-1 focus:ring-ring"
              style={{ color: "var(--ink)", border: "0.8px solid rgba(21,23,28,0.08)" }}
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="relative px-6 py-14 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          {filtered.length === 0 ? (
            <div className="glass-shell mx-auto max-w-sm text-center">
              <div className="glass-card" style={{ borderRadius: "23px" }}>
                <Layers className="mx-auto h-10 w-10 opacity-30" style={{ color: "var(--ink)" }} />
                <p className="mt-4 text-[14px]" style={{ color: "var(--ink-soft)" }}>No trainings found.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, i) => {
                const discountPercent = t.originalPrice > 0 ? Math.round(((t.originalPrice - t.discountedPrice) / t.originalPrice) * 100) : 0;
                
                return (
                  <motion.article
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-shell group"
                  >
                    <div
                      className="glass-card flex flex-col overflow-hidden p-0 transition-all group-hover:-translate-y-1 h-full"
                      style={{ borderRadius: "23px" }}
                    >
                      {/* Banner */}
                      <div className="relative aspect-[16/9] overflow-hidden" style={{ borderRadius: "23px 23px 0 0", background: "var(--amber-soft)" }}>
                        {t.bannerUrl ? (
                          <img src={t.bannerUrl} alt={t.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="grid h-full w-full place-items-center">
                            <Layers className="h-10 w-10 opacity-25" style={{ color: "var(--ink)" }} />
                          </div>
                        )}
                        {discountPercent > 0 && (
                          <div className="absolute right-3 top-3 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider bg-moss text-paper">
                            {discountPercent}% OFF
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-6">
                        <h2 className="text-xl font-bold leading-tight tracking-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                          {t.title}
                        </h2>
                        
                        <div className="mt-5 mb-auto">
                          <p className="text-[12px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--ink-mute)" }}>You will learn</p>
                          <ul className="flex flex-wrap gap-2">
                            {t.youWillLearn.map(skill => (
                              <li key={skill} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium" style={{ background: "rgba(21,23,28,0.05)", color: "var(--ink-soft)" }}>
                                <CheckCircle2 className="h-3 w-3 opacity-50" />
                                {skill}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between pt-5 gap-4" style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)" }}>
                          <div>
                            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--ink-mute)" }}>Program Fee</p>
                            <div className="flex items-end gap-2.5">
                              <span className="text-2xl font-bold leading-none" style={{ color: "var(--ink)" }}>₹{t.discountedPrice}</span>
                              <span className="text-[14px] line-through leading-none opacity-60 mb-0.5" style={{ color: "var(--ink-mute)" }}>₹{t.originalPrice}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleShare(t.id)}
                              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors hover:bg-secondary/60"
                              style={{ color: "var(--ink-soft)" }}
                            >
                              <Share2 className="h-4 w-4" />
                              {copiedId === t.id ? "Copied!" : "Share"}
                            </button>
                            <Link href="/trainings/$slug"
                              params={{ slug: t.slug || t.id }}
                              className="btn-primary justify-center"
                            >
                              Enroll Now <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
