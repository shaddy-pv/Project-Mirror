import  createFileRoute,  from 'next/link';
import { motion } from "motion/react";
import { ArrowUpRight, ArrowRight, Check, Terminal, Cpu, GitBranch, Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import { auth as oauthService } from "@/integrations/oauth";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuthContext } from "./__root";
import { isUserAdmin } from "@/lib/admin.functions";
import { WebGLBackground } from "@/components/WebGLBackground";
import { getPlatformStats, getLatestCohort } from "@/lib/public.functions";
import { listPublishedCourses } from "@/lib/courses.functions";

,
});

/* -------------------------------------------------------------------------- */

function Nav() {
  const auth = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: isAdmin } = useQuery({
    queryKey: ["isUserAdmin", auth.user?.uid],
    queryFn: () => isUserAdmin(),
    enabled: auth.isAuthenticated,
  });

  const links = [
    ["Courses", "/courses"],
    ["Training", "/trainings"],
    ["Internships", "/internship"],
    ["Careers", "/careers"],
    ["Shop", "/shop"],
    ["Services", "/services"],
  ];

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await oauthService.signOut();
    navigate({ to: "/auth", replace: true, search: {} });
  };

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-[18px]" style={{ borderColor: "rgba(21,23,28,0.09)", background: "rgba(255,255,255,0.72)" }}>
      <div className="mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-lg text-[13px] font-bold"
            style={{ background: "var(--ink)", color: "#FFF9ED" }}
          >E</span>
          <span style={{ fontFamily: "Archivo Variable", fontWeight: 660, fontSize: "17px", letterSpacing: "-0.03em", color: "var(--ink)" }}>Enginow</span>
        </Link>

        <nav className="hidden justify-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="link-draw text-[13.5px]" style={{ color: "var(--ink-soft)" }}>
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {auth.isLoading ? (
            <div className="h-8 w-28 animate-pulse rounded-full" style={{ background: "rgba(21,23,28,0.06)" }} />
          ) : auth.isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin-dashboard"
                  className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors sm:inline-flex"
                  style={{ background: "var(--amber)", color: "var(--ink)", border: "0.8px solid rgba(21,23,28,0.12)" }}
                >
                  Admin Panel
                </Link>
              )}
              <Link href="/learner-dashboard"
                className="hidden items-center gap-1.5 text-[13.5px] sm:inline-flex"
                style={{ color: "var(--ink-soft)" }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] transition-colors"
                style={{ border: "0.8px solid rgba(21,23,28,0.14)", color: "var(--ink-soft)" }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth"
                className="hidden text-[13.5px] sm:inline"
                style={{ color: "var(--ink-soft)" }}
                search={{}}
              >
                Sign in
              </Link>
              <a
                href="/courses"
                className="btn-primary group inline-flex"
              >
                Start learning
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

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
    <div className="relative overflow-hidden rounded-2xl text-[#FFF9ED]" style={{
      background: "var(--ink)",
      border: "0.8px solid rgba(255,255,255,0.10)",
      boxShadow: "rgba(21,23,28,0.14) 0px 10px 22px 0px"
    }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "0.8px solid rgba(255,255,255,0.08)" }}>
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
            <span className={l.c} style={i === 6 ? { color: "var(--amber)" } : undefined}>{l.t || "\u00A0"}</span>
            {i === lines.length - 1 && <span className="caret ml-0.5 inline-block h-4 w-1.5 align-middle" style={{ background: "#FFF9ED" }} />}
          </div>
        ))}
      </pre>
      <div className="mono flex items-center justify-between px-4 py-2.5 text-[10.5px] opacity-45" style={{ borderTop: "0.8px solid rgba(255,255,255,0.08)" }}>
        <span className="inline-flex items-center gap-1.5"><GitBranch className="h-3 w-3" /> main · ch.4/12</span>
        <span className="opacity-70">UTF-8 · LN 10, COL 2</span>
      </div>
    </div>
  );
}

function ProgressCard() {
  return (
    <div className="glass-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--ink-mute)" }}>Currently learning</div>
          <div className="mt-1 text-[14px] font-bold" style={{ color: "var(--ink)" }}>Applied ML · Course 02</div>
        </div>
        <span className="mono text-[10px]" style={{ color: "var(--ink-mute)" }}>0x42A-FB</span>
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <div className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>68<span style={{ color: "var(--ink-mute)" }}>%</span></div>
        <div className="mono text-[10.5px]" style={{ color: "var(--moss)" }}>on schedule</div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(21,23,28,0.08)" }}>
        <div className="progress-bar h-full rounded-full" style={{ background: "var(--ink)", ["--target" as any]: "68%" }} />
      </div>
      <ul className="mt-5 space-y-2.5 text-[13px]">
        {[
          ["Linear models", "done"],
          ["Backpropagation", "done"],
          ["Convolutions", "next"],
        ].map(([l, s]) => (
          <li key={l} className="flex items-center justify-between">
            <span className="flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
              <span className={`grid h-4 w-4 place-items-center rounded-full`} style={{
                border: s === "done" ? `0.8px solid var(--ink)` : `0.8px solid rgba(21,23,28,0.25)`,
                background: s === "done" ? "var(--ink)" : "transparent",
                color: s === "done" ? "#FFF9ED" : "transparent"
              }}>
                {s === "done" ? <Check className="h-2.5 w-2.5" /> : null}
              </span>
              {l}
            </span>
            <span className={`mono text-[10.5px] uppercase tracking-wider`} style={{
              color: s === "next" ? "var(--amber-bright)" : "var(--ink-mute)"
            }}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hero() {
  const { data: stats } = useQuery({
    queryKey: ["public", "stats"],
    queryFn: getPlatformStats,
  });

  const { data: latestCohort } = useQuery({
    queryKey: ["public", "latestCohort"],
    queryFn: getLatestCohort,
  });

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "90vh" }}>
      {/* WebGL noise haze background — homepage hero only */}
      <WebGLBackground />

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 pt-10 pb-24 md:px-10 md:pt-16 md:pb-32">
        {/* running head */}
        <div className="col-span-12 flex items-center gap-4 pb-3" style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}>
          <span className="mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "var(--amber-bright)" }}>— 01</span>
          <span className="mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "var(--ink-mute)" }}>Prospectus</span>
          <span className="h-px flex-1" style={{ background: "rgba(21,23,28,0.09)" }} />
          {latestCohort ? (
            <span className="mono hidden text-[10.5px] md:inline" style={{ color: "var(--ink-mute)" }}>{latestCohort.title} · v{new Date().getFullYear()}.1</span>
          ) : (
            <span className="mono hidden text-[10.5px] md:inline" style={{ color: "var(--ink-mute)" }}>Winter cohort · v2026.1</span>
          )}
        </div>

        <div className="col-span-12 mt-10 md:col-span-7 md:mt-14">
          {latestCohort && (
            <Link href="/trainings/$slug" params={{ slug: latestCohort.slug || latestCohort.id }}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10.5px] transition-transform hover:scale-105"
                style={{
                  background: "var(--amber)",
                  border: "0.8px solid rgba(21,23,28,0.10)",
                  color: "var(--ink)",
                  fontFamily: "Geist, monospace",
                  fontWeight: 700,
                }}
              >
                <Sparkles className="h-3 w-3" />
                {latestCohort.title} · Enrollments Open
              </motion.div>
            </Link>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className={`display text-[13vw] md:text-[7.2vw] ${latestCohort ? 'mt-6' : ''}`}
            style={{ color: "var(--ink)" }}
          >
            Learn engineering,
            <br />
            <span className="italic-serif" style={{ color: "#B8922E" }}>deeply</span>
            <span style={{ color: "var(--ink)" }}>.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl text-[16px] leading-relaxed"
            style={{ color: "var(--ink-soft)", fontFamily: "Geist, sans-serif" }}
          >
            Enginow is a modern learning platform for engineers who build real things.
            Courses, cohort training, internships and careers — designed by practitioners,
            taught with code you can run.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a href="/courses" className="btn-primary group">
              Browse courses
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="/internship" className="btn-outline group">
              Apply for internship
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6 pt-6"
            style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)" }}
          >
            {[
              [`${stats ? (stats.users > 1000 ? (stats.users/1000).toFixed(1) + 'k+' : stats.users) : '0'}`, "Engineers learning", "since '24"],
              [`${stats ? stats.courses : '0'}`, "Runnable courses", "always accessible"],
              [`${stats ? stats.enrollments : '0'}`, "Total enrollments", "across all programs"],
            ].map(([n, l, sub]) => (
              <div key={l}>
                <dt className="display text-3xl" style={{ color: "var(--ink)" }}>{n}</dt>
                <dd className="mt-1 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>{l}</dd>
                <dd className="mono mt-0.5 text-[10px]" style={{ color: "var(--ink-mute)" }}>{sub}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Hero cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-12 mt-8 md:col-span-5 md:mt-14"
        >
          <div className="relative">
            <div className="relative">
              <div className="rotate-[-1.5deg] transition-transform hover:rotate-0 duration-500">
                <CodePanel />
              </div>
              <div className="relative -mt-10 ml-10 rotate-[2deg] transition-transform hover:rotate-0 duration-500">
                <ProgressCard />
              </div>
              <div className="mono mt-5 flex items-center justify-between text-[10px]" style={{ color: "var(--ink-mute)" }}>
                <span>Fig. 01 · Learner surface</span>
                <span>enginow.com/app</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Marquee() {
  const items = [
    "Machine Learning", "Systems Design", "Data Structures", "Embedded",
    "Full-stack", "DevOps", "AI Research", "Design Engineering", "Cloud", "Rust · WASM",
  ];
  return (
    <section style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)", borderBottom: "0.8px solid rgba(21,23,28,0.09)", background: "var(--amber-soft)" }}>
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-6 py-3 md:px-10">
        <span className="mono hidden shrink-0 text-[10px] uppercase tracking-[0.22em] md:inline" style={{ color: "var(--ink-mute)" }}>
          Stack specialisations —
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16" style={{ background: `linear-gradient(to right, var(--amber-soft), transparent)` }} />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16" style={{ background: `linear-gradient(to left, var(--amber-soft), transparent)` }} />
          <div className="marquee-track flex gap-3 whitespace-nowrap py-1">
            {[...items, ...items, ...items].map((t, i) => (
              <span
                key={i}
                className="mono inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px]"
                style={{
                  background: "rgba(255,255,255,0.60)",
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

// Using real courses now instead of demoCoursesData

function Courses() {
  const { data: coursesData } = useQuery({
    queryKey: ["publishedCourses"],
    queryFn: listPublishedCourses,
  });

  const courses = Array.isArray(coursesData) ? coursesData.slice(0, 4) : [];

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-28">
      <header className="grid grid-cols-12 gap-6 pb-8" style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}>
        <div className="col-span-12 md:col-span-8">
          <div className="eyebrow">— 02 / Curriculum</div>
          <h2 className="display mt-4 text-5xl md:text-7xl" style={{ color: "var(--ink)" }}>
            Courses you can <span className="italic-serif" style={{ color: "#B8922E" }}>run</span>.
          </h2>
        </div>
        <p className="col-span-12 self-end text-[14px] leading-relaxed md:col-span-4" style={{ color: "var(--ink-soft)" }}>
          Every chapter ships with a runnable notebook, a problem set, and a peer review. No
          autoplay filler, no sponsored detours.
        </p>
      </header>

      <ul className="mt-4 divide-y" style={{ ["--tw-divide-opacity" as any]: 1 }}>
        {courses.map((c: any, i: number) => (
          <Link href="/courses/$slug" params={{ slug: c.slug || c.id }} key={c.id || i} className="block group transition-all"
            style={{
              borderBottom: "0.8px solid rgba(21,23,28,0.09)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,232,184,0.10)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <motion.li
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-12 items-center gap-4 py-7"
            >
              <div className="col-span-1 mono text-[12px]" style={{ color: "var(--ink-mute)" }}>{String(i + 1).padStart(2, '0')}</div>
              <div className="col-span-11 md:col-span-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold tracking-tight md:text-2xl" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                    {c.title}
                  </h3>
                  {c.discountedPrice === 0 && (
                    <span
                      className="hidden rounded-full px-2.5 py-0.5 text-[10.5px] font-bold md:inline"
                      style={{ background: "var(--tertiary)", color: "var(--ink)" }}
                    >
                      Free
                    </span>
                  )}
                </div>
                <div className="mt-1.5 mono flex items-center gap-2 text-[11px]" style={{ color: "var(--ink-mute)" }}>
                  <span>{c.category || "Development"}</span>
                  <span className="opacity-40">·</span>
                  <span>{c.modules?.length || 0} chapters</span>
                </div>
              </div>
              <div className="col-span-4 hidden md:col-span-1 md:block">
                <span className="mono text-[11px]" style={{ color: "var(--ink-soft)" }}>{c.duration || "10h"}</span>
              </div>
              <div className="col-span-4 hidden md:col-span-2 md:block">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 mono text-[10.5px]"
                  style={{ border: "0.8px solid rgba(21,23,28,0.12)", color: "var(--ink-soft)" }}
                >
                  <Cpu className="h-3 w-3" /> {c.level || "All levels"}
                </span>
              </div>
              <div className="col-span-12 flex items-center justify-between md:col-span-2 md:justify-end">
                <span className="text-lg font-bold" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                  {c.discountedPrice > 0 ? `₹${c.discountedPrice}` : "Free"}
                </span>
                <ArrowUpRight className="ml-3 h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: "var(--ink-mute)" }} />
              </div>
            </motion.li>
          </Link>
        ))}
      </ul>

      <div className="mt-10 flex justify-end">
        <a href="/courses" className="link-draw text-[13px]" style={{ color: "var(--ink)" }}>
          See the full catalogue →
        </a>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Programs() {
  const rows = [
    { k: "Training", d: "Cohort-based programs led by senior engineers. Twelve weeks, live sessions, real projects.", href: "/training" },
    { k: "Practice", d: "A library of DSA problems, quizzes and proctored assessments to sharpen fundamentals.", href: "/practice" },
    { k: "Careers", d: "Curated engineering roles at studios and startups that respect craft.", href: "/careers" },
    { k: "Services", d: "Websites, apps, and custom software built by our alumni collective.", href: "/services" },
    { k: "Resources", d: "Reading lists, PDFs and long-form notes from working practitioners.", href: "/resources" },
    { k: "Certificates", d: "Verifiable credentials employers can check in one click.", href: "/verify" },
  ];
  return (
    <section style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)", borderBottom: "0.8px solid rgba(21,23,28,0.09)", background: "var(--amber-soft)" }}>
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-0 px-6 py-24 md:px-10">
        <div className="col-span-12 md:col-span-4">
          <div className="eyebrow">— 03 / Platform</div>
          <h2 className="display mt-4 text-4xl md:text-6xl" style={{ color: "var(--ink)" }}>
            More than a <span className="italic-serif" style={{ color: "#B8922E" }}>course</span> shelf.
          </h2>
          <p className="mt-6 max-w-sm text-[14px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Six connected surfaces — learn, practice, get hired, and stay sharp. One account,
            one profile, one certificate wall.
          </p>
        </div>
        <ul className="col-span-12 mt-10 grid grid-cols-1 md:col-span-8 md:mt-0 md:grid-cols-2">
          {rows.map((r, i) => (
            <motion.li
              key={r.k}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-8 transition-colors"
              style={{
                borderBottom: "0.8px solid rgba(21,23,28,0.09)",
                ...(i % 2 === 0 ? { borderRight: "0.8px solid rgba(21,23,28,0.09)" } : {}),
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.70)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <a href={r.href} className="block">
                <div className="flex items-start justify-between">
                  <span className="display text-2xl" style={{ color: "var(--ink)" }}>{r.k}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" style={{ color: "var(--ink-mute)" }} />
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>{r.d}</p>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Seasons() {
  const s = [
    { name: "Spring", month: "February", tone: "12-week cohort" },
    { name: "Summer", month: "May", tone: "6-week intensive" },
    { name: "Monsoon", month: "July", tone: "10-week remote" },
    { name: "Winter", month: "December", tone: "8-week onsite" },
  ];
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-28">
      <header className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-7">
          <div className="eyebrow">— 04 / Internships</div>
          <h2 className="display mt-4 text-5xl md:text-7xl leading-[0.95]" style={{ color: "var(--ink)" }}>
            Four intakes, <span className="italic-serif" style={{ color: "#B8922E" }}>one</span> studio.
          </h2>
        </div>
        <p className="col-span-12 self-end text-[14px] leading-relaxed md:col-span-4 md:col-start-9" style={{ color: "var(--ink-soft)" }}>
          Applications open two months before each cohort. Paid, mentored, and shipping real
          work with our engineering team.
        </p>
      </header>

      <div className="mt-14 grid grid-cols-12 gap-4">
        {s.map((season, i) => (
          <motion.a
            href={`/${season.name.toLowerCase()}-internship`}
            key={season.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.28, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="glass-shell col-span-12 md:col-span-3"
          >
            <div
              className="glass-card group flex h-full flex-col justify-between transition-all hover:-translate-y-1"
              style={{ borderRadius: "23px" }}
            >
              <div className="flex items-baseline justify-between">
                <span className="mono text-[11px]" style={{ color: "var(--ink-mute)" }}>0{i + 1} / 04</span>
                <span className="mono text-[11px]" style={{ color: "var(--ink-mute)" }}>{season.month}</span>
              </div>
              <div className="mt-20">
                <div className="display text-3xl md:text-4xl" style={{ color: "var(--ink)" }}>{season.name}</div>
                <div className="mt-1.5 text-[13px]" style={{ color: "var(--ink-soft)" }}>{season.tone}</div>
                <div className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-bold transition-colors group-hover:text-[#B8922E]" style={{ color: "var(--ink)" }}>
                  Apply
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Thesis() {
  const bullets = [
    ["Runnable, not watchable", "Every chapter ships a notebook and problem set."],
    ["Small cohorts, real review", "Live sessions capped at 40, weekly code review."],
    ["Made by practitioners", "Instructors are working engineers, not influencers."],
    ["Verifiable outcomes", "One-click verifiable certificates for employers."],
  ];
  return (
    <section style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)", borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}>
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-6 py-24 md:px-10 md:py-28">
        <div className="col-span-12 md:col-span-5">
          <div className="eyebrow">— 05 / Why Enginow</div>
          <h2 className="display mt-4 text-4xl md:text-6xl leading-[0.95]" style={{ color: "var(--ink)" }}>
            Built for engineers who <span className="italic-serif" style={{ color: "#B8922E" }}>actually build</span>.
          </h2>
          <p className="mt-6 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Most online learning is edutainment. We wrote our platform for people who want
            to leave with skills a hiring manager can test in 30 minutes.
          </p>
        </div>
        <ul className="col-span-12 grid grid-cols-1 gap-6 md:col-span-6 md:col-start-7 md:grid-cols-2">
          {bullets.map(([h, d]) => (
            <li key={h} className="pt-5" style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)" }}>
              <div className="flex items-center gap-2 text-[14px] font-bold" style={{ color: "var(--ink)", fontFamily: "Archivo Variable" }}>
                <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: "var(--amber)", flexShrink: 0 }}>
                  <Check className="h-3 w-3" style={{ color: "var(--ink)" }} />
                </span>
                {h}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Testimonials() {
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
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-28">
      <div className="eyebrow">— 06 / From alumni</div>
      <div className="mt-6 grid grid-cols-12 gap-6">
        {t.map((x, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.28, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="glass-shell col-span-12 md:col-span-4"
          >
            <div className="glass-card" style={{ borderRadius: "23px" }}>
              <blockquote className="text-[17px] leading-snug" style={{ color: "var(--ink)", fontFamily: "Archivo Variable", fontStyle: "italic" }}>
                "{x.q}"
              </blockquote>
              <figcaption className="mt-8 flex items-baseline justify-between pt-4" style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)" }}>
                <span className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>{x.n}</span>
                <span className="mono text-[11px]" style={{ color: "var(--ink-mute)" }}>{x.r}</span>
              </figcaption>
            </div>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function CTA() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--ink)", color: "#FFF9ED" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,232,184,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,232,184,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-24 md:px-10 md:py-32">
        <div className="col-span-12 md:col-span-9">
          <div className="mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,232,184,0.6)" }}>— 07 / Enrol</div>
          <h2 className="display mt-6 text-5xl leading-[0.95] md:text-[8vw]" style={{ color: "#FFF9ED" }}>
            Build the career <br />
            you would <span className="italic-serif" style={{ color: "var(--amber)" }}>actually</span> want.
          </h2>
        </div>
        <div className="col-span-12 flex flex-col justify-end gap-6 md:col-span-3">
          <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,249,237,0.70)" }}>
            One account for courses, internships and careers. Free to start, verifiable
            certificates included.
          </p>
          <a
            href="/auth"
            className="btn-amber group inline-flex w-fit"
          >
            Create your account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Footer() {
  const col = (h: string, items: [string, string][]) => (
    <div>
      <div className="eyebrow">{h}</div>
      <ul className="mt-4 space-y-2 text-[13px]">
        {items.map(([l, href]) => (
          <li key={l}>
            <a href={href} className="link-draw" style={{ color: "var(--ink-soft)" }}>{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)" }}>
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-6 py-16 md:px-10">
        <div className="col-span-12 md:col-span-4">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="grid h-7 w-7 place-items-center rounded-lg text-[13px] font-bold" style={{ background: "var(--ink)", color: "#FFF9ED" }}>E</span>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>Enginow</span>
          </div>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            A modern learning platform for engineers. Built with care in India, used the world over.
          </p>
        </div>
        <div className="col-span-6 md:col-span-2">
          {col("Learn", [["Courses", "/courses"], ["Training", "/training"], ["Practice", "/practice"], ["Resources", "/resources"]])}
        </div>
        <div className="col-span-6 md:col-span-2">
          {col("Work", [["Careers", "/careers"], ["Internships", "/internship"], ["Services", "/services"], ["Shop", "/shop"]])}
        </div>
        <div className="col-span-6 md:col-span-2">
          {col("Company", [["About", "/about"], ["Shop", "/shop"], ["Services", "/services"], ["Contact", "/contact"], ["Verify", "/verify"]])}
        </div>
        <div className="col-span-6 md:col-span-2">
          {col("Legal", [["Privacy", "/privacy-policy"], ["Terms", "/terms-and-conditions"], ["Refund", "/refund-policy"], ["Cookies", "/cookie-policy"]])}
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 px-6 py-6 text-[12px] md:flex-row md:items-center md:px-10" style={{ borderTop: "0.8px solid rgba(21,23,28,0.09)", color: "var(--ink-mute)" }}>
        <span>© {new Date().getFullYear()} Enginow. All rights reserved.</span>
        <span className="mono">enginow.com</span>
      </div>
    </footer>
  );
}

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
