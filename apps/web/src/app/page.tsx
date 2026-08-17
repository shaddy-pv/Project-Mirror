"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Terminal,
  Cpu,
  GitBranch,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Layers,
  BookOpen,
  Briefcase,
  Award,
  FileText,
  Workflow,
} from "lucide-react";
import dynamic from "next/dynamic";
import { auth as oauthService } from "@/integrations/oauth";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { TiltCard } from "@/components/interactive/TiltCard";
import { getPlatformStats, getLatestCohort } from "@/lib/public.functions";
import { listPublishedCourses } from "@/lib/courses.functions";

const WebGLBackground = dynamic(
  () => import("@/components/WebGLBackground").then((mod) => mod.WebGLBackground),
  { ssr: false }
);

// Register plugins once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/* -------------------------------------------------------------------------- */
/*                                 NAVBAR                                     */
/* -------------------------------------------------------------------------- */

function Nav() {
  const auth = useAuthContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  const links = [
    ["Courses", "/#courses"],
    ["Training", "/#programs"],
    ["Internships", "/#internships"],
    ["Why Us", "/#why-us"],
    ["Careers", "/careers"],
    ["Shop", "/shop"],
    ["Services", "/services"],
  ];

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await oauthService.signOut();
    router.push("/auth");
  };

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-[20px] transition-colors"
      style={{
        borderColor: "rgba(21,23,28,0.08)",
        background: "rgba(255,255,255,0.80)",
      }}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-lg text-[13px] font-bold transition-transform group-hover:scale-105 shadow-sm"
            style={{ background: "var(--ink)", color: "#FFF9ED" }}
          >
            E
          </span>
          <span
            style={{
              fontFamily: "Archivo Variable",
              fontWeight: 660,
              fontSize: "17px",
              letterSpacing: "-0.03em",
              color: "var(--ink)",
            }}
          >
            Enginow
          </span>
        </Link>

        <nav className="hidden justify-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="link-draw text-[13.5px] transition-colors hover:text-[#15171C]"
              style={{ color: "var(--ink-soft)" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {auth.isLoading ? (
            <div
              className="h-8 w-28 animate-pulse rounded-full"
              style={{ background: "rgba(21,23,28,0.06)" }}
            />
          ) : auth.isAuthenticated ? (
            <>
              <Link
                href="/learner-dashboard"
                className="hidden items-center gap-1.5 text-[13.5px] sm:inline-flex hover:text-[#15171C] transition-colors"
                style={{ color: "var(--ink-soft)" }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] transition-all hover:bg-[rgba(21,23,28,0.04)]"
                style={{
                  border: "0.8px solid rgba(21,23,28,0.14)",
                  color: "var(--ink-soft)",
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="hidden text-[13.5px] sm:inline hover:text-[#15171C] transition-colors"
                style={{ color: "var(--ink-soft)" }}
              >
                Sign in
              </Link>
              <Link href="/courses" className="btn-primary group inline-flex shadow-sm">
                Start learning
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                               HERO PANELS                                  */
/* -------------------------------------------------------------------------- */

function CodePanel() {
  const lines = [
    { t: "// ch.04 — backpropagation", c: "opacity-40" },
    { t: "import { grad, tensor } from '@enginow/nn'", c: "opacity-70" },
    { t: "", c: "" },
    { t: "const model = network([784, 128, 10])", c: "opacity-90" },
    { t: "const loss  = grad(model, crossEntropy)", c: "opacity-90" },
    { t: "", c: "" },
    { t: "// step through weights →", c: "" },
    { t: "for (const batch of dataset) {", c: "opacity-90" },
    { t: "  model.update(loss(batch), lr = 0.01)", c: "opacity-90" },
    { t: "}", c: "opacity-90" },
  ];

  return (
    <TiltCard maxTilt={6} className="rounded-2xl shadow-2xl">
      <div
        className="relative overflow-hidden rounded-2xl text-[#FFF9ED]"
        style={{
          background: "var(--ink)",
          border: "0.8px solid rgba(255,255,255,0.12)",
          boxShadow: "rgba(21,23,28,0.2) 0px 20px 40px -10px",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: "0.8px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FF6058" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FFBD2E" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#27C93F" }} />
          </div>
          <div className="mono flex items-center gap-2 text-[10.5px] opacity-45">
            <Terminal className="h-3 w-3" />
            lesson-04-backprop.ts
          </div>
        </div>
        <pre className="mono px-5 py-5 text-[12.5px] leading-[1.75]">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-4">
              <span className="w-4 select-none text-right opacity-25">{l.t ? i + 1 : ""}</span>
              <span className={l.c} style={i === 6 ? { color: "var(--amber)" } : undefined}>
                {l.t || "\u00A0"}
              </span>
              {i === lines.length - 1 && (
                <span
                  className="caret ml-0.5 inline-block h-4 w-1.5 align-middle"
                  style={{ background: "#FFF9ED" }}
                />
              )}
            </div>
          ))}
        </pre>
        <div
          className="mono flex items-center justify-between px-4 py-2.5 text-[10.5px] opacity-45"
          style={{ borderTop: "0.8px solid rgba(255,255,255,0.08)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <GitBranch className="h-3 w-3" /> main · ch.4/12
          </span>
          <span className="opacity-70">UTF-8 · LN 10, COL 2</span>
        </div>
      </div>
    </TiltCard>
  );
}

function ProgressCard() {
  return (
    <TiltCard maxTilt={8} className="rounded-[24px]">
      <div className="glass-card backdrop-blur-xl border border-white/60 bg-white/75 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--ink-mute)" }}>
              Currently learning
            </div>
            <div className="mt-1 text-[14px] font-bold" style={{ color: "var(--ink)" }}>
              Applied ML · Course 02
            </div>
          </div>
          <span className="mono text-[10px]" style={{ color: "var(--ink-mute)" }}>
            0x42A-FB
          </span>
        </div>
        <div className="mt-5 flex items-baseline gap-2">
          <div
            className="text-4xl font-bold tracking-tight"
            style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}
          >
            68<span style={{ color: "var(--ink-mute)" }}>%</span>
          </div>
          <div className="mono text-[10.5px]" style={{ color: "var(--moss)" }}>
            on schedule
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(21,23,28,0.08)" }}>
          <div
            className="progress-bar h-full rounded-full"
            style={{ background: "var(--ink)", "--target": "68%" } as React.CSSProperties}
          />
        </div>
        <ul className="mt-5 space-y-2.5 text-[13px]">
          {[
            ["Linear models", "done"],
            ["Backpropagation", "done"],
            ["Convolutions", "next"],
          ].map(([l, s]) => (
            <li key={l} className="flex items-center justify-between">
              <span className="flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
                <span
                  className="grid h-4 w-4 place-items-center rounded-full"
                  style={{
                    border: s === "done" ? "0.8px solid var(--ink)" : "0.8px solid rgba(21,23,28,0.25)",
                    background: s === "done" ? "var(--ink)" : "transparent",
                    color: s === "done" ? "#FFF9ED" : "transparent",
                  }}
                >
                  {s === "done" ? <Check className="h-2.5 w-2.5" /> : null}
                </span>
                {l}
              </span>
              <span
                className="mono text-[10.5px] uppercase tracking-wider font-semibold"
                style={{
                  color: s === "next" ? "#B8922E" : "var(--ink-mute)",
                }}
              >
                {s}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </TiltCard>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HERO                                     */
/* -------------------------------------------------------------------------- */

function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const codePanelRef = useRef<HTMLDivElement>(null);
  const progressCardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDListElement>(null);

  const { data: stats } = useQuery({
    queryKey: ["public", "stats"],
    queryFn: getPlatformStats,
  });

  const { data: latestCohort } = useQuery({
    queryKey: ["public", "latestCohort"],
    queryFn: getLatestCohort,
  });

  useGSAP(
    () => {
      // 1. Entrance timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-running-head", { y: -20, opacity: 0, duration: 0.6 })
        .from(titleRef.current, { y: 40, opacity: 0, duration: 0.9 }, "-=0.3")
        .from(descRef.current, { y: 25, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(statsRef.current, { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
        .from([codePanelRef.current, progressCardRef.current], {
          y: 60,
          opacity: 0,
          scale: 0.94,
          stagger: 0.15,
          duration: 0.9,
          ease: "back.out(1.4)",
        }, "-=0.6");

      // 2. Parallax ScrollTrigger for cards
      gsap.to(codePanelRef.current, {
        y: -45,
        rotateZ: -2,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(progressCardRef.current, {
        y: 40,
        rotateZ: 3,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    },
    { scope: heroRef }
  );

  return (
    <section ref={heroRef} className="relative overflow-hidden" style={{ minHeight: "90vh" }}>
      <WebGLBackground />

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 pt-10 pb-24 md:px-10 md:pt-16 md:pb-32">
        {/* running head */}
        <div
          className="hero-running-head col-span-12 flex items-center gap-4 pb-3"
          style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}
        >
          <span className="mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "#B8922E" }}>
            — 01
          </span>
          <span className="mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "var(--ink-mute)" }}>
            Prospectus
          </span>
          <span className="h-px flex-1" style={{ background: "rgba(21,23,28,0.09)" }} />
          {latestCohort ? (
            <span className="mono hidden text-[10.5px] md:inline" style={{ color: "var(--ink-mute)" }}>
              {latestCohort.title} · v{new Date().getFullYear()}.1
            </span>
          ) : (
            <span className="mono hidden text-[10.5px] md:inline" style={{ color: "var(--ink-mute)" }}>
              Winter cohort · v2026.1
            </span>
          )}
        </div>

        <div className="col-span-12 mt-10 md:col-span-7 md:mt-14">
          {latestCohort && (
            <Link href={`/trainings/${latestCohort.slug || latestCohort.id}`}>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10.5px] transition-transform hover:scale-105 shadow-sm cursor-pointer"
                style={{
                  background: "var(--amber)",
                  border: "0.8px solid rgba(21,23,28,0.10)",
                  color: "var(--ink)",
                  fontFamily: "Geist, monospace",
                  fontWeight: 700,
                }}
              >
                <Sparkles className="h-3 w-3 text-amber-900" />
                {latestCohort.title} · Enrollments Open
              </div>
            </Link>
          )}

          <h1
            ref={titleRef}
            className={`display text-[13vw] md:text-[7.2vw] tracking-tight ${latestCohort ? "mt-6" : ""}`}
            style={{ color: "var(--ink)" }}
          >
            Learn engineering,
            <br />
            <span className="italic-serif" style={{ color: "#B8922E" }}>
              deeply
            </span>
            <span style={{ color: "var(--ink)" }}>.</span>
          </h1>

          <p
            ref={descRef}
            className="mt-8 max-w-xl text-[16.5px] leading-relaxed"
            style={{ color: "var(--ink-soft)", fontFamily: "Geist, sans-serif" }}
          >
            Enginow is a modern learning platform for engineers who build real things.
            Courses, cohort training, internships and careers — designed by practitioners,
            taught with code you can run.
          </p>

          <div ref={ctaRef} className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/courses" className="btn-primary group shadow-md">
              Browse courses
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/internship" className="btn-outline group hover:border-black/30">
              Apply for internship
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <dl
            ref={statsRef}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6 pt-6"
            style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)" }}
          >
            {[
              [
                `${stats ? (stats.users > 1000 ? (stats.users / 1000).toFixed(1) + "k+" : stats.users) : "0"}`,
                "Engineers learning",
                "since '24",
              ],
              [`${stats ? stats.courses : "0"}`, "Runnable courses", "always accessible"],
              [`${stats ? stats.enrollments : "0"}`, "Total enrollments", "across all programs"],
            ].map(([n, l, sub]) => (
              <div key={l} className="transition-transform hover:translate-y-[-2px] duration-200">
                <dt className="display text-3xl" style={{ color: "var(--ink)" }}>
                  {n}
                </dt>
                <dd className="mt-1 text-[12.5px] font-medium" style={{ color: "var(--ink-soft)" }}>
                  {l}
                </dd>
                <dd className="mono mt-0.5 text-[10px]" style={{ color: "var(--ink-mute)" }}>
                  {sub}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Hero floating cards */}
        <div className="col-span-12 mt-8 md:col-span-5 md:mt-14">
          <div className="relative">
            <div ref={codePanelRef} className="relative z-10">
              <CodePanel />
            </div>
            <div ref={progressCardRef} className="relative z-20 -mt-10 ml-6 sm:ml-10">
              <ProgressCard />
            </div>
            <div
              className="mono mt-5 flex items-center justify-between text-[10px]"
              style={{ color: "var(--ink-mute)" }}
            >
              <span>Fig. 01 · Learner surface</span>
              <span>enginow.com/app</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  MARQUEE                                   */
/* -------------------------------------------------------------------------- */

function Marquee() {
  const items = [
    "Machine Learning",
    "Systems Design",
    "Data Structures",
    "Embedded",
    "Full-stack",
    "DevOps",
    "AI Research",
    "Design Engineering",
    "Cloud",
    "Rust · WASM",
  ];

  return (
    <section
      style={{
        borderTop: "0.8px solid rgba(21,23,28,0.09)",
        borderBottom: "0.8px solid rgba(21,23,28,0.09)",
        background: "var(--amber-soft)",
      }}
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-6 py-3 md:px-10">
        <span
          className="mono hidden shrink-0 text-[10px] uppercase tracking-[0.22em] font-semibold md:inline"
          style={{ color: "var(--ink-mute)" }}
        >
          Stack specialisations —
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16"
            style={{ background: "linear-gradient(to right, var(--amber-soft), transparent)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16"
            style={{ background: "linear-gradient(to left, var(--amber-soft), transparent)" }}
          />
          <div className="marquee-track flex gap-3 whitespace-nowrap py-1">
            {[...items, ...items, ...items].map((t, i) => (
              <span
                key={i}
                className="mono inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px] transition-transform hover:scale-105 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.70)",
                  border: "0.8px solid rgba(21,23,28,0.09)",
                  color: "var(--ink-soft)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--amber-bright)" }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               COURSES SECTION                              */
/* -------------------------------------------------------------------------- */

const DEFAULT_COURSES = [
  { id: "1", title: "Applied Machine Learning & Neural Networks", category: "AI & ML", modules: Array(8).fill(0), duration: "18h", level: "Intermediate", discountedPrice: 0, slug: "applied-ml" },
  { id: "2", title: "Distributed Systems & Consensus in Rust", category: "Systems", modules: Array(6).fill(0), duration: "24h", level: "Advanced", discountedPrice: 4999, slug: "distributed-systems" },
  { id: "3", title: "Compilers, ASTs & LLVM Code Generation", category: "Compilers", modules: Array(5).fill(0), duration: "16h", level: "Advanced", discountedPrice: 3499, slug: "compilers-llvm" },
  { id: "4", title: "Modern Full-Stack Architecture & Cloud", category: "Cloud & Web", modules: Array(7).fill(0), duration: "20h", level: "All levels", discountedPrice: 0, slug: "cloud-architecture" },
];

function Courses() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: coursesData } = useQuery({
    queryKey: ["publishedCourses"],
    queryFn: listPublishedCourses,
  });

  const courses = Array.isArray(coursesData) && coursesData.length > 0 ? coursesData.slice(0, 6) : DEFAULT_COURSES;

  useGSAP(
    () => {
      const items = containerRef.current?.querySelectorAll(".course-card-item");
      if (items && items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "all",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 90%",
              once: true,
            },
          }
        );
      }
    },
    { scope: containerRef, dependencies: [courses] }
  );

  return (
    <section id="courses" ref={containerRef} className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-28">
      <header
        className="grid grid-cols-12 gap-6 pb-8"
        style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}
      >
        <div className="col-span-12 md:col-span-8">
          <div className="eyebrow">— 02 / Curriculum</div>
          <h2 className="display mt-4 text-5xl md:text-7xl" style={{ color: "var(--ink)" }}>
            Courses you can <span className="italic-serif" style={{ color: "#B8922E" }}>run</span>.
          </h2>
        </div>
        <p
          className="col-span-12 self-end text-[14.5px] leading-relaxed md:col-span-4"
          style={{ color: "var(--ink-soft)" }}
        >
          Every chapter ships with a runnable notebook, a problem set, and a peer review. No
          autoplay filler, no sponsored detours.
        </p>
      </header>

      <ul className="mt-4 divide-y" style={{ borderColor: "rgba(21,23,28,0.09)" }}>
        {courses.map((c: any, i: number) => {
          const coursePrice = typeof c.discountedPrice === "number" ? c.discountedPrice : (typeof c.price === "number" ? c.price : 0);
          const isFree = Boolean(c.isFree || coursePrice === 0);
          const title = c.title || "Engineering Track";
          const category = c.category || "Engineering";
          const duration = c.duration || "18h";
          const level = c.level || "Intermediate";
          const chaptersCount = Array.isArray(c.modules) && c.modules.length > 0 
            ? `${c.modules.length} chapters` 
            : (Array.isArray(c.chapters) && c.chapters.length > 0 ? `${c.chapters.length} chapters` : "8 chapters");

          return (
            <Link
              href={`/courses/${c.slug || c.id}`}
              key={c.id || i}
              className="course-card-item block group transition-all"
              style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}
            >
              <TiltCard
                maxTilt={3}
                glow={true}
                className="grid grid-cols-12 items-center gap-4 py-7 px-4 rounded-xl transition-colors group-hover:bg-[#FFE8B8]/10"
              >
                <div className="col-span-1 mono text-[12px]" style={{ color: "var(--ink-mute)" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-11 md:col-span-6">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-xl font-bold tracking-tight md:text-2xl transition-colors group-hover:text-[#B8922E]"
                      style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}
                    >
                      {title}
                    </h3>
                    {isFree && (
                      <span
                        className="hidden rounded-full px-2.5 py-0.5 text-[10.5px] font-bold md:inline"
                        style={{ background: "var(--tertiary)", color: "var(--ink)" }}
                      >
                        Free
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 mono flex items-center gap-2 text-[11px]" style={{ color: "var(--ink-mute)" }}>
                    <span>{category}</span>
                    <span className="opacity-40">·</span>
                    <span>{chaptersCount}</span>
                  </div>
                </div>
                <div className="col-span-4 hidden md:col-span-1 md:block">
                  <span className="mono text-[11px]" style={{ color: "var(--ink-soft)" }}>
                    {duration}
                  </span>
                </div>
                <div className="col-span-4 hidden md:col-span-2 md:block">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 mono text-[10.5px]"
                    style={{ border: "0.8px solid rgba(21,23,28,0.12)", color: "var(--ink-soft)" }}
                  >
                    <Cpu className="h-3 w-3" /> {level}
                  </span>
                </div>
                <div className="col-span-12 flex items-center justify-between md:col-span-2 md:justify-end">
                  <span className="text-lg font-bold" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                    {!isFree && coursePrice > 0 ? `₹${coursePrice}` : "Free"}
                  </span>
                  <ArrowUpRight
                    className="ml-3 h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                    style={{ color: "var(--ink-mute)" }}
                  />
                </div>
              </TiltCard>
            </Link>
          );
        })}
      </ul>

      <div className="mt-10 flex justify-end">
        <Link href="/courses" className="link-draw text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
          See the full catalogue →
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                        PLATFORM SECTION (BENTO CARDS)                      */
/* -------------------------------------------------------------------------- */

function Programs() {
  const containerRef = useRef<HTMLDivElement>(null);

  const rows = [
    {
      k: "Training",
      icon: BookOpen,
      badge: "Cohorts",
      d: "Cohort-based programs led by senior engineers. Twelve weeks, live sessions, real projects.",
      href: "/trainings",
    },
    {
      k: "Practice",
      icon: Workflow,
      badge: "Interactive",
      d: "A library of DSA problems, quizzes and proctored assessments to sharpen fundamentals.",
      href: "/practice",
    },
    {
      k: "Careers",
      icon: Briefcase,
      badge: "Hiring",
      d: "Curated engineering roles at studios and startups that respect craft.",
      href: "/careers",
    },
    {
      k: "Services",
      icon: Layers,
      badge: "Collective",
      d: "Websites, apps, and custom software built by our alumni collective.",
      href: "/services",
    },
    {
      k: "Resources",
      icon: FileText,
      badge: "Library",
      d: "Reading lists, PDFs and long-form notes from working practitioners.",
      href: "/resources",
    },
    {
      k: "Certificates",
      icon: Award,
      badge: "Verifiable",
      d: "Verifiable credentials employers can check in one click.",
      href: "/verify",
    },
  ];

  useGSAP(
    () => {
      gsap.from(".bento-card", {
        opacity: 0,
        y: 50,
        scale: 0.96,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="programs"
      ref={containerRef}
      style={{
        borderTop: "0.8px solid rgba(21,23,28,0.09)",
        borderBottom: "0.8px solid rgba(21,23,28,0.09)",
        background: "var(--amber-soft)",
      }}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-6 py-24 md:px-10 md:py-28">
        <div className="col-span-12 md:col-span-4">
          <div className="eyebrow">— 03 / Platform</div>
          <h2 className="display mt-4 text-4xl md:text-6xl" style={{ color: "var(--ink)" }}>
            More than a <span className="italic-serif" style={{ color: "#B8922E" }}>course</span> shelf.
          </h2>
          <p className="mt-6 max-w-sm text-[14.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Six connected surfaces — learn, practice, get hired, and stay sharp. One account,
            one profile, one certificate wall.
          </p>
        </div>

        <div className="col-span-12 grid grid-cols-1 gap-4 md:col-span-8 sm:grid-cols-2">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.k} className="bento-card">
                <Link href={r.href} className="block h-full">
                  <TiltCard
                    maxTilt={5}
                    className="glass-card flex h-full flex-col justify-between p-6 sm:p-7 rounded-[22px] border border-white/80 bg-white/70 shadow-sm transition-all hover:shadow-xl hover:bg-white/90"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[rgba(21,23,28,0.06)] flex items-center justify-center text-[#15171C]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="mono text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#FFE8B8]/40 text-[#15171C]">
                            {r.badge}
                          </span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" style={{ color: "var(--ink-mute)" }} />
                      </div>
                      <h3 className="display mt-5 text-2xl tracking-tight" style={{ color: "var(--ink)" }}>
                        {r.k}
                      </h3>
                      <p className="mt-2.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                        {r.d}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: "#B8922E", borderTop: "0.8px solid rgba(21,23,28,0.06)" }}>
                      Explore {r.k} →
                    </div>
                  </TiltCard>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                       SEASONS / INTERNSHIPS CARDS                          */
/* -------------------------------------------------------------------------- */

function Seasons() {
  const containerRef = useRef<HTMLDivElement>(null);

  const s = [
    { name: "Spring", month: "February", tone: "12-week cohort", tag: "Q1" },
    { name: "Summer", month: "May", tone: "6-week intensive", tag: "Q2" },
    { name: "Monsoon", month: "July", tone: "10-week remote", tag: "Q3" },
    { name: "Winter", month: "December", tone: "8-week onsite", tag: "Q4" },
  ];

  useGSAP(
    () => {
      gsap.from(".season-card", {
        opacity: 0,
        y: 60,
        scale: 0.94,
        stagger: 0.1,
        duration: 0.8,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section id="internships" ref={containerRef} className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-28">
      <header className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-7">
          <div className="eyebrow">— 04 / Internships</div>
          <h2 className="display mt-4 text-5xl md:text-7xl leading-[0.95]" style={{ color: "var(--ink)" }}>
            Four intakes, <span className="italic-serif" style={{ color: "#B8922E" }}>one</span> studio.
          </h2>
        </div>
        <p
          className="col-span-12 self-end text-[14.5px] leading-relaxed md:col-span-4 md:col-start-9"
          style={{ color: "var(--ink-soft)" }}
        >
          Applications open two months before each cohort. Paid, mentored, and shipping real
          work with our engineering team.
        </p>
      </header>

      <div className="mt-14 grid grid-cols-12 gap-5">
        {s.map((season, i) => (
          <div key={season.name} className="season-card col-span-12 sm:col-span-6 md:col-span-3">
            <Link href={`/${season.name.toLowerCase()}-internship`} className="block h-full">
              <TiltCard maxTilt={6} className="h-full rounded-[24px]">
                <div
                  className="glass-card flex h-full flex-col justify-between p-6 sm:p-7 transition-all hover:-translate-y-1.5 shadow-md hover:shadow-2xl border border-white/80 bg-white/60"
                  style={{ borderRadius: "24px" }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="mono text-[11px] font-bold" style={{ color: "#B8922E" }}>
                      0{i + 1} · {season.tag}
                    </span>
                    <span className="mono text-[11px] px-2 py-0.5 rounded-full bg-[rgba(21,23,28,0.06)]" style={{ color: "var(--ink-mute)" }}>
                      {season.month}
                    </span>
                  </div>

                  <div className="mt-16 sm:mt-20">
                    <div className="display text-3xl md:text-4xl" style={{ color: "var(--ink)" }}>
                      {season.name}
                    </div>
                    <div className="mt-1.5 text-[13px] font-medium" style={{ color: "var(--ink-soft)" }}>
                      {season.tone}
                    </div>
                    <div
                      className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-bold transition-all group-hover:translate-x-1"
                      style={{ color: "var(--ink)" }}
                    >
                      Apply for {season.name}
                      <ArrowRight className="h-3.5 w-3.5 text-[#B8922E]" />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   THESIS                                   */
/* -------------------------------------------------------------------------- */

function Thesis() {
  const containerRef = useRef<HTMLDivElement>(null);

  const bullets = [
    ["Runnable, not watchable", "Every chapter ships a notebook and problem set."],
    ["Small cohorts, real review", "Live sessions capped at 40, weekly code review."],
    ["Made by practitioners", "Instructors are working engineers, not influencers."],
    ["Verifiable outcomes", "One-click verifiable certificates for employers."],
  ];

  useGSAP(
    () => {
      gsap.from(".thesis-item", {
        opacity: 0,
        x: 30,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="why-us"
      ref={containerRef}
      style={{
        borderTop: "0.8px solid rgba(21,23,28,0.09)",
        borderBottom: "0.8px solid rgba(21,23,28,0.09)",
      }}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-6 py-24 md:px-10 md:py-28">
        <div className="col-span-12 md:col-span-5">
          <div className="eyebrow">— 05 / Why Enginow</div>
          <h2 className="display mt-4 text-4xl md:text-6xl leading-[0.95]" style={{ color: "var(--ink)" }}>
            Built for engineers who{" "}
            <span className="italic-serif" style={{ color: "#B8922E" }}>
              actually build
            </span>
            .
          </h2>
          <p className="mt-6 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Most online learning is edutainment. We wrote our platform for people who want
            to leave with skills a hiring manager can test in 30 minutes.
          </p>
        </div>

        <ul className="col-span-12 grid grid-cols-1 gap-6 md:col-span-6 md:col-start-7 md:grid-cols-2">
          {bullets.map(([h, d]) => (
            <li
              key={h}
              className="thesis-item pt-5 transition-transform hover:translate-x-1 duration-200"
              style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)" }}
            >
              <div
                className="flex items-center gap-2.5 text-[14.5px] font-bold"
                style={{ color: "var(--ink)", fontFamily: "Archivo Variable" }}
              >
                <span
                  className="grid h-5 w-5 place-items-center rounded-full shadow-sm"
                  style={{ background: "var(--amber)", flexShrink: 0 }}
                >
                  <Check className="h-3 w-3" style={{ color: "var(--ink)" }} />
                </span>
                {h}
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {d}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                TESTIMONIALS                                */
/* -------------------------------------------------------------------------- */

function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  const t = [
    {
      q: "Enginow felt less like a course platform and more like an actual engineering apprenticeship. I finished things here.",
      n: "Ananya R.",
      r: "ML Engineer · Bengaluru",
    },
    {
      q: "The internship was the first time an engineering program treated me like a colleague, not a customer.",
      n: "Kabir M.",
      r: "Product Engineer · Berlin",
    },
    {
      q: "Runnable notebooks, honest feedback, small cohorts. Everything online learning usually isn't.",
      n: "Priya S.",
      r: "Founding Engineer · remote",
    },
  ];

  useGSAP(
    () => {
      gsap.from(".quote-card", {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section id="testimonials" ref={containerRef} className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-28">
      <div className="eyebrow">— 06 / From alumni</div>
      <div className="mt-6 grid grid-cols-12 gap-6">
        {t.map((x, i) => (
          <div key={i} className="quote-card col-span-12 md:col-span-4">
            <TiltCard maxTilt={5} className="h-full rounded-[24px]">
              <div
                className="glass-card flex h-full flex-col justify-between p-7 rounded-[24px] border border-white/80 bg-white/70 shadow-md transition-all hover:shadow-xl"
              >
                <blockquote
                  className="text-[17px] leading-snug"
                  style={{
                    color: "var(--ink)",
                    fontFamily: "Archivo Variable",
                    fontStyle: "italic",
                  }}
                >
                  &quot;{x.q}&quot;
                </blockquote>
                <figcaption
                  className="mt-8 flex items-baseline justify-between pt-4"
                  style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)" }}
                >
                  <span className="text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
                    {x.n}
                  </span>
                  <span className="mono text-[11px]" style={{ color: "var(--ink-mute)" }}>
                    {x.r}
                  </span>
                </figcaption>
              </div>
            </TiltCard>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                     CTA                                    */
/* -------------------------------------------------------------------------- */

function CTA() {
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".cta-content", {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
        },
      });
    },
    { scope: ctaRef }
  );

  return (
    <section
      id="enroll"
      ref={ctaRef}
      className="relative overflow-hidden"
      style={{ background: "var(--ink)", color: "#FFF9ED" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,232,184,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,232,184,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-24 md:px-10 md:py-32 cta-content">
        <div className="col-span-12 md:col-span-9">
          <div
            className="mono text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(255,232,184,0.6)" }}
          >
            — 07 / Enrol
          </div>
          <h2 className="display mt-6 text-5xl leading-[0.95] md:text-[8vw]" style={{ color: "#FFF9ED" }}>
            Build the career <br />
            you would <span className="italic-serif" style={{ color: "var(--amber)" }}>actually</span> want.
          </h2>
        </div>
        <div className="col-span-12 flex flex-col justify-end gap-6 md:col-span-3">
          <p className="text-[14.5px] leading-relaxed" style={{ color: "rgba(255,249,237,0.75)" }}>
            One account for courses, internships and careers. Free to start, verifiable
            certificates included.
          </p>
          <Link href="/auth" className="btn-amber group inline-flex w-fit shadow-lg shadow-amber-900/20">
            Create your account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   FOOTER                                   */
/* -------------------------------------------------------------------------- */

function Footer() {
  const col = (h: string, items: [string, string][]) => (
    <div>
      <div className="eyebrow font-semibold">{h}</div>
      <ul className="mt-4 space-y-2 text-[13px]">
        {items.map(([l, href]) => (
          <li key={l}>
            <Link href={href} className="link-draw hover:text-[#15171C]" style={{ color: "var(--ink-soft)" }}>
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)", background: "var(--paper)" }}>
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-6 py-16 md:px-10">
        <div className="col-span-12 md:col-span-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-lg text-[13px] font-bold"
              style={{ background: "var(--ink)", color: "#FFF9ED" }}
            >
              E
            </span>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}
            >
              Enginow
            </span>
          </div>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            A modern learning platform for engineers. Built with care in India, used the world over.
          </p>
        </div>
        <div className="col-span-6 md:col-span-2">
          {col("Learn", [
            ["Courses", "/#courses"],
            ["Training", "/#programs"],
            ["Practice", "/practice"],
            ["Resources", "/resources"],
          ])}
        </div>
        <div className="col-span-6 md:col-span-2">
          {col("Work", [
            ["Careers", "/careers"],
            ["Internships", "/#internships"],
            ["Services", "/services"],
            ["Shop", "/shop"],
          ])}
        </div>
        <div className="col-span-6 md:col-span-2">
          {col("Company", [
            ["Why Enginow", "/#why-us"],
            ["Testimonials", "/#testimonials"],
            ["Shop", "/shop"],
            ["Services", "/services"],
            ["Contact", "/contact"],
            ["Verify", "/verify"],
          ])}
        </div>
        <div className="col-span-6 md:col-span-2">
          {col("Legal", [
            ["Privacy", "/privacy-policy"],
            ["Terms", "/terms-and-conditions"],
            ["Refund", "/refund-policy"],
            ["Cookies", "/cookie-policy"],
          ])}
        </div>
      </div>
      <div
        className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 px-6 py-6 text-[12px] md:flex-row md:items-center md:px-10"
        style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)", color: "var(--ink-mute)" }}
      >
        <span>© {new Date().getFullYear()} Enginow. All rights reserved.</span>
        <span className="mono">enginow.com</span>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN LANDING                                 */
/* -------------------------------------------------------------------------- */

export default function Landing() {
  return (
    <main className="min-h-screen" style={{ background: "var(--paper)" }}>
      <Nav />
      <Hero />
      <Marquee />
      <Courses />
      <Programs />
      <Seasons />
      <Thesis />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
