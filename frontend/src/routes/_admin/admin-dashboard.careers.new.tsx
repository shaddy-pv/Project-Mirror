import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { adminCreateCareer } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin-dashboard/careers/new")({
  component: NewCareerPage,
});

const DOMAINS = ["Software Engineering", "Product Management", "Data Science", "Design", "Marketing", "DevOps", "Cybersecurity", "Sales", "Human Resources"];
const LOCATIONS = ["Remote", "Onsite", "Hybrid"] as const;
const PERKS_OPTIONS = [
  "Health Insurance",
  "Paid Time Off (PTO)",
  "Remote Work Options",
  "Flexible Hours",
  "Stock Options / Equity",
  "Learning & Development Budget",
  "Retirement/401k Matching"
];

function NewCareerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    domain: "Software Engineering",
    description: "",
    locationType: "Remote" as typeof LOCATIONS[number],
    tags: "",
    responsibilities: "",
    perks: [] as string[],
    openFrom: new Date().toISOString().split("T")[0],
    openUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminCreateCareer({ data: form });
      navigate({ to: "/admin-dashboard/careers" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-10">
      <button
        onClick={() => navigate({ to: "/admin-dashboard/careers" })}
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-mute hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to careers
      </button>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">New Career</h1>
      
      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Job Title *</label>
          <input required value={form.title} onChange={(e) => set("title", e.target.value)}
            className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
            placeholder="e.g. Senior Frontend Engineer" />
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
            placeholder="Brief overview of the role..." />
        </div>

        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Responsibilities</label>
          <textarea value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)}
            rows={4} className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring resize-none"
            placeholder="List key responsibilities, one per line..." />
        </div>

        <div>
          <label className="mono text-[10px] uppercase tracking-widest text-ink-mute mb-2 block">Benefits / Perks (Select all that apply)</label>
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
              placeholder="e.g. URGENT, Remote First" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Open From</label>
            <input type="date" value={form.openFrom} onChange={(e) => set("openFrom", e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Open Until</label>
            <input type="date" value={form.openUntil} onChange={(e) => set("openUntil", e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-ink py-2.5 text-[14px] font-medium text-paper hover:bg-ink/90 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Creating…" : "Create Career Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
