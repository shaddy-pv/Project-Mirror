import { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";
import { Target, Clock, Cpu, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Enginow",
  description: "We are building the ultimate learning house for engineers.",
};

const pillars = [
  { icon: Target, title: "Our Mission", text: "Bridge the gap between academic learning and industry expectations. We provide hands-on, practical education so you can build real software from day one." },
  { icon: Clock, title: "Our Timeline", text: "From a small idea about engineering education, to cohort training, internships, and a full-stack platform — we keep shipping." },
  { icon: Cpu, title: "Our Stack", text: "Next.js 16, React 19, TypeScript, Express.js, MongoDB, TanStack — chosen because we use them in production and teach what we know." },
  { icon: Sparkles, title: "What Makes Us Different", text: "We don't just teach theory. Our platform integrates learning, practice, assessments, and real internships into one cohesive journey." },
];

export default function AboutPage() {
  return (
    <PolicyLayout
      title="About Enginow"
      subtitle="We are building the ultimate learning house for engineers — courses, internships, and careers designed by practitioners."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {pillars.map(({ icon: Icon, title, text }) => (
          <section key={title}>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--amber-soft)" }}>
                <Icon className="h-4 w-4" style={{ color: "#B8922E" }} />
              </div>
              <h2 className="text-base font-bold" style={{ color: "var(--ink)", borderBottom: "none", padding: 0 }}>{title}</h2>
            </div>
            <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>{text}</p>
          </section>
        ))}
      </div>
    </PolicyLayout>
  );
}
