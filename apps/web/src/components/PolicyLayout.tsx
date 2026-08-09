import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export function PolicyLayout({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string;
  subtitle?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen" style={{ background: "#FFFFFF" }}>
      {/* Background gradient */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "400px",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.38) 0%, rgba(255,248,234,0.12) 55%, transparent 80%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-paper"
        style={{ opacity: 0.04 }}
      />

      {/* Header */}
      <section
        className="relative px-6 pb-14 pt-24 md:px-10"
        style={{ borderBottom: "0.8px solid rgba(21,23,28,0.08)" }}
      >
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] transition-colors"
            style={{ color: "var(--ink-mute)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>

        <div className="mx-auto max-w-3xl">
          <span className="eyebrow">— Legal</span>
          <h1
            className="display mt-3 text-4xl md:text-5xl"
            style={{ color: "var(--ink)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-4 max-w-xl text-[15px] leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              {subtitle}
            </p>
          )}
          {updated && (
            <p className="mono mt-3 text-[11px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>
              Last updated: {updated}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="relative px-6 py-14 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="policy-content space-y-10">{children}</div>
        </div>
      </section>

      <style>{`
        .policy-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 0.75rem;
          font-family: "Archivo Variable", sans-serif;
          padding-bottom: 0.5rem;
          border-bottom: 0.8px solid rgba(21,23,28,0.08);
        }
        .policy-content p {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: var(--ink-soft);
        }
        .policy-content ul {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .policy-content li {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: var(--ink-soft);
          padding-left: 1.25rem;
          position: relative;
        }
        .policy-content li::before {
          content: "–";
          position: absolute;
          left: 0;
          color: var(--ink-mute);
        }
        .policy-content strong {
          color: var(--ink);
          font-weight: 600;
        }
        .policy-content em {
          color: var(--ink-soft);
        }
        .policy-content section {
          padding: 1.75rem;
          border-radius: 16px;
          border: 0.8px solid rgba(21,23,28,0.08);
          background: rgba(255,255,255,0.8);
        }
      `}</style>
    </main>
  );
}
