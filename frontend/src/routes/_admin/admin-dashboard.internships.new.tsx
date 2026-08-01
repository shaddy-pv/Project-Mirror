import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { adminCreateInternship } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin-dashboard/internships/new")({
  component: NewInternshipPage,
});

const INTERNSHIP_TYPES = ["Summer", "Monsoon", "Winter", "Spring"] as const;
const DURATIONS = ["1 Month", "2 Months", "3 Months", "6 Months"] as const;
const DOMAINS = ["Web Development", "App Development", "AI/ML", "Data Science", "Design", "Marketing", "Content Writing", "DevOps", "Cybersecurity", "Electronics"];
const LOCATIONS = ["Remote", "Onsite", "Hybrid"] as const;
const PERKS_OPTIONS = [
  "Certificate of Completion",
  "Letter of Recommendation (LOR)",
  "Letter of Experience (LOE)",
  "Flexible Timing",
  "Remote Work Opportunity",
  "Pre-Placement Offer (PPO)",
  "Mentorship Sessions"
];

function NewInternshipPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "Summer" as typeof INTERNSHIP_TYPES[number],
    domain: "Web Development",
    duration: "1 Month" as typeof DURATIONS[number],
    description: "",
    stipend: "",
    locationType: "Remote" as typeof LOCATIONS[number],
    tags: "",
    responsibilities: "",
    perks: [] as string[],
  });

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminCreateInternship({ data: form });
      navigate({ to: "/admin-dashboard/internships" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-10">
      <button
        onClick={() => navigate({ to: "/admin-dashboard/internships" })}
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-mute hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to internships
      </button>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">New Internship</h1>

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Title *</label>
          <input required value={form.title} onChange={(e) => set("title", e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
            placeholder="e.g. Full Stack Developer Intern" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Internship Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring">
              {INTERNSHIP_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Duration</label>
            <select value={form.duration} onChange={(e) => set("duration", e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring">
              {DURATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Domain</label>
          <select value={form.domain} onChange={(e) => set("domain", e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring">
            {DOMAINS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            rows={3} className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring resize-none"
            placeholder="What will the intern be doing?" />
        </div>

        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Stipend</label>
          <input value={form.stipend} onChange={(e) => set("stipend", e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
            placeholder="e.g. ₹10,000 / month or Unpaid" />
        </div>

        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Responsibilities</label>
          <textarea value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)}
            rows={4} className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring resize-none"
            placeholder="List responsibilities, one per line..." />
        </div>

        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-ink-mute mb-2 block">Perks (Select all that apply)</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERKS_OPTIONS.map((perk) => (
              <label key={perk} className="flex items-center gap-2 text-[13.5px]">
                <input 
                  type="checkbox" 
                  checked={form.perks.includes(perk)}
                  onChange={(e) => {
                    const newPerks = e.target.checked 
                      ? [...form.perks, perk] 
                      : form.perks.filter(p => p !== perk);
                    set("perks", newPerks);
                  }}
                  className="rounded border-input text-ink focus:ring-ring"
                />
                {perk}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Location</label>
            <select value={form.locationType} onChange={(e) => set("locationType", e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring">
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => set("tags", e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
              placeholder="e.g. Featured, Hot, Remote" />
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-ink py-2.5 text-[14px] font-medium text-paper hover:bg-ink/90 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Creating…" : "Create Internship"}
          </button>
        </div>
      </form>
    </div>
  );
}
