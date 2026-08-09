import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Monitor, Smartphone, Code2, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Services — Enginow",
  description: "Professional services by Enginow — Web Development, App Development, Custom Software Solutions, and Consulting.",
};

const services = [
  {
    title: "Website Development",
    description: "Modern, responsive, and performant web applications tailored to your business needs.",
    icon: Monitor,
    accent: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
  },
  {
    title: "App Development",
    description: "Native and cross-platform mobile applications for iOS and Android built with production-grade tooling.",
    icon: Smartphone,
    accent: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
  },
  {
    title: "Custom Software Solutions",
    description: "Bespoke software architecture and development for complex business logic and deep integrations.",
    icon: Code2,
    accent: "#059669",
    bg: "rgba(5,150,105,0.08)",
  },
  {
    title: "Consulting",
    description: "Expert technical consulting for startups and enterprises looking to scale their engineering teams and products.",
    icon: Lightbulb,
    accent: "#B8922E",
    bg: "rgba(184,146,46,0.08)",
  },
];

export default function ServicesPage() {
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
          height: "500px",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.38) 0%, rgba(255,248,234,0.12) 55%, transparent 80%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.04 }} />

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

        <div className="mx-auto max-w-[1440px]">
          <span className="eyebrow">— What We Offer</span>
          <h1 className="display mt-3 max-w-2xl text-5xl md:text-6xl" style={{ color: "var(--ink)" }}>
            Our{" "}
            <span className="italic-serif" style={{ color: "#B8922E" }}>
              Services
            </span>
            .
          </h1>
          <p
            className="mt-6 max-w-lg text-[15px] leading-relaxed md:text-[17px]"
            style={{ color: "var(--ink-soft)" }}
          >
            We empower individuals, companies, and startups with top-tier engineering solutions — from day one to scale.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.title}
                className="glass-shell group"
              >
                <div
                  className="glass-card flex h-full flex-col p-8 transition-all group-hover:-translate-y-1"
                  style={{ borderRadius: "23px" }}
                >
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl"
                    style={{ background: service.bg }}
                  >
                    <service.icon className="h-7 w-7" style={{ color: service.accent }} />
                  </div>
                  <h2
                    className="mt-6 text-2xl font-bold leading-tight"
                    style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}
                  >
                    {service.title}
                  </h2>
                  <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    {service.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div
            className="mt-14 rounded-3xl p-10 text-center"
            style={{ background: "var(--amber-soft)", border: "0.8px solid rgba(184,146,46,0.2)" }}
          >
            <h2 className="text-3xl font-bold" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
              Ready to start a project?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Contact us today to discuss your requirements and let our expert team bring your vision to life.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[14px] font-semibold text-paper transition-all hover:opacity-90"
              style={{ background: "var(--ink)" }}
            >
              Get in Touch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
