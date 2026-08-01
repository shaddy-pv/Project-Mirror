import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, Calendar, MapPin, Briefcase, ChevronRight, X, Loader2, CheckCircle2 } from "lucide-react";
import { getInternships, applyForInternship, getMyInternshipApplications } from "@/lib/internships.functions";
import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuthContext } from "./__root";

interface InternshipItem {
  id: string;
  title: string;
  type: string;
  domain: string;
  duration: string;
  description: string;
  stipend: string;
  locationType: string;
  tags: string;
  openFrom: string;
  openUntil: string;
  isOpen: boolean;
  responsibilities?: string;
  perks?: string[];
}

const internshipsQueryOptions = queryOptions({
  queryKey: ["internships"],
  queryFn: () => getInternships(),
});

export const Route = createFileRoute("/internship")({
  loader: ({ context }) => context.queryClient.ensureQueryData(internshipsQueryOptions),
  component: InternshipsPage,
  head: () => ({
    meta: [
      { title: "Internships — Enginow" },
      { name: "description", content: "Apply for Summer, Winter, Monsoon, and Spring internships." },
    ],
  }),
});

const TYPES = ["All", "Summer", "Monsoon", "Winter", "Spring"];

function InternshipsPage() {
  const { isAuthenticated } = useAuthContext();
  const { data: internships } = useSuspenseQuery(internshipsQueryOptions);
  
  const { data: myApps = [] } = useQuery({
    queryKey: ["my-internship-applications"],
    queryFn: () => getMyInternshipApplications(),
    enabled: isAuthenticated,
  });

  const appliedIds = useMemo(() => new Set((myApps as any[]).map(a => a.internshipId)), [myApps]);

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");

  const [selectedInternship, setSelectedInternship] = useState<InternshipItem | null>(null);

  const filtered = useMemo(() => {
    return (internships as InternshipItem[]).filter((i) => {
      const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) || 
                            i.domain.toLowerCase().includes(search.toLowerCase());
      const matchesType = activeType === "All" || i.type === activeType;
      return matchesSearch && matchesType;
    });
  }, [internships, search, activeType]);

  return (
    <main className="relative min-h-screen" style={{ background: "#FFFFFF" }}>
      {/* Background elements */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "500px", pointerEvents: "none",
        background: "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.42) 0%, rgba(255,248,234,0.14) 55%, transparent 80%)"
      }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.05 }} />

      <section className="relative px-6 pb-20 pt-24 md:px-10" style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}>
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] transition-colors" style={{ color: "var(--ink-mute)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>

        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
                <span className="eyebrow">— Opportunities</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="display mt-3 max-w-2xl text-5xl md:text-6xl"
                style={{ color: "var(--ink)" }}>
                Global <span className="italic-serif" style={{ color: "#B8922E" }}>Internships</span>.
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-6 max-w-lg text-[15px] leading-relaxed md:text-[17px]" style={{ color: "var(--ink-soft)" }}>
                Apply for our Summer, Winter, Monsoon, and Spring programs. 
                Kickstart your career with real-world projects and mentorship.
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex shrink-0 items-center justify-end">
              <div className="text-right">
                <span className="mono text-[11px] font-bold" style={{ color: "var(--ink)" }}>
                  {filtered.length} position{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="sticky top-0 z-20 px-6 py-4 md:px-10" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "0.8px solid rgba(21,23,28,0.06)" }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors ${activeType === type ? "bg-ink text-paper" : "bg-paper shadow-sm hover:bg-paper-dark"}`}
                style={activeType !== type ? { color: "var(--ink-soft)", border: "0.8px solid rgba(21,23,28,0.08)" } : undefined}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--ink-mute)" }} />
            <input
              type="text"
              placeholder="Search domain or title..."
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
                <Briefcase className="mx-auto h-10 w-10 opacity-30" style={{ color: "var(--ink)" }} />
                <p className="mt-4 text-[14px]" style={{ color: "var(--ink-soft)" }}>No internships found for this criteria.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-shell group"
                >
                  <div className="glass-card flex h-full flex-col p-6 transition-all group-hover:-translate-y-1" style={{ borderRadius: "23px" }}>
                    
                    <div className="flex items-start justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                           style={{ background: "var(--amber-soft)", color: "var(--ink)" }}>
                        {item.type}
                      </div>
                      {item.tags && (
                        <div className="mono text-[10px] uppercase tracking-widest text-ink-mute">
                          {item.tags.split(",")[0]}
                        </div>
                      )}
                    </div>

                    <h2 className="mt-5 text-xl font-bold leading-tight tracking-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                      {item.title}
                    </h2>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
                        <Briefcase className="h-3.5 w-3.5 opacity-60" /> {item.domain}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
                        <MapPin className="h-3.5 w-3.5 opacity-60" /> {item.locationType}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
                        <Calendar className="h-3.5 w-3.5 opacity-60" /> {item.duration}
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-3 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                      {item.description}
                    </p>

                    <div className="mt-auto pt-6">
                      <div className="mb-4 flex items-center justify-between text-[13px]">
                        <span className="font-medium" style={{ color: "var(--ink)" }}>Stipend</span>
                        <span style={{ color: "var(--ink-soft)" }}>{item.stipend || "Unpaid"}</span>
                      </div>
                    <div className="mt-5 border-t border-[rgba(21,23,28,0.06)] pt-5">
                      <button
                        disabled={!item.isOpen || appliedIds.has(item.id)}
                        onClick={() => setSelectedInternship(item)}
                        className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13.5px] font-medium transition-colors ${
                          appliedIds.has(item.id)
                            ? "cursor-default bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.isOpen
                              ? "bg-ink text-paper hover:bg-ink/90"
                              : "cursor-not-allowed bg-ink/5 text-ink-mute"
                        }`}
                      >
                        {appliedIds.has(item.id) ? (
                          <>
                            Applied <CheckCircle2 className="h-4 w-4" />
                          </>
                        ) : item.isOpen ? (
                          <>
                            Apply Now <ChevronRight className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          "Coming Soon"
                        )}
                      </button>
                    </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Modal */}
      <ApplyModal internship={selectedInternship} onClose={() => setSelectedInternship(null)} />
    </main>
  );
}

function ApplyModal({ internship, onClose }: { internship: InternshipItem | null; onClose: () => void }) {
  const { isAuthenticated } = useAuthContext();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    cityState: "",
    experience: "Fresher",
    education: "",
    college: "",
    graduationYear: "",
    semester: "",
    cgpa: "",
    skills: "",
    availability: "Immediately",
    resumeUrl: "",
    coverLetter: "",
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internship) return;
    if (!isAuthenticated) {
      setError("Please log in to apply.");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    try {
      await applyForInternship({ data: { internshipId: internship.id, ...form } });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={!!internship} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {internship && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 z-[100] w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 p-4 md:p-6"
              >
                <div className="glass-shell w-full overflow-hidden">
                  <div className="glass-card flex max-h-[85vh] flex-col md:flex-row bg-paper/95 overflow-hidden" style={{ borderRadius: "23px" }}>
                    
                    {success ? (
                      <div className="flex w-full flex-col items-center justify-center py-20 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <h2 className="mt-6 text-3xl font-bold text-ink">Application Submitted!</h2>
                        <p className="mt-3 text-[15px] text-ink-soft">We'll review your profile and be in touch soon.</p>
                      </div>
                    ) : (
                      <>
                        {/* LEFT PANEL: APPLICATION FORM */}
                        <div className="flex-1 overflow-y-auto border-r border-ink/5 p-6 md:p-8 custom-scrollbar">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="text-2xl font-bold text-ink" style={{ fontFamily: "Archivo Variable" }}>Application Form</h2>
                              <p className="mt-1 text-[13px] text-ink-mute">Fill in your details accurately to apply.</p>
                            </div>
                            <Dialog.Close asChild className="md:hidden">
                              <button className="rounded-full p-2 text-ink-mute hover:bg-ink/5 hover:text-ink">
                                <X className="h-5 w-5" />
                              </button>
                            </Dialog.Close>
                          </div>

                          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            {!isAuthenticated && (
                              <div className="rounded-md bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
                                You must be logged in to apply.
                              </div>
                            )}

                            <div className="grid gap-5 md:grid-cols-2">
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Full Name *</label>
                                <input required value={form.fullName} onChange={e => set("fullName", e.target.value)}
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Email *</label>
                                <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Phone Number *</label>
                                <input required type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">City, State *</label>
                                <input required value={form.cityState} onChange={e => set("cityState", e.target.value)}
                                  placeholder="e.g. Bangalore, Karnataka"
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">LinkedIn Profile *</label>
                                <input required type="url" value={form.linkedin} onChange={e => set("linkedin", e.target.value)}
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Github Profile</label>
                                <input type="url" value={form.github} onChange={e => set("github", e.target.value)}
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Highest Education *</label>
                                <input required value={form.education} onChange={e => set("education", e.target.value)}
                                  placeholder="e.g. B.Tech Computer Science"
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">College Name *</label>
                                <input required value={form.college} onChange={e => set("college", e.target.value)}
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-3">
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Graduation Year *</label>
                                <input required value={form.graduationYear} onChange={e => set("graduationYear", e.target.value)}
                                  placeholder="e.g. 2026"
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Current Semester</label>
                                <input value={form.semester} onChange={e => set("semester", e.target.value)}
                                  placeholder="e.g. 6th"
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Current CGPA</label>
                                <input value={form.cgpa} onChange={e => set("cgpa", e.target.value)}
                                  placeholder="e.g. 8.5"
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                              </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Experience Level *</label>
                                <select required value={form.experience} onChange={e => set("experience", e.target.value)}
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring">
                                  <option>Fresher</option>
                                  <option>0-1 Years</option>
                                  <option>1-2 Years</option>
                                  <option>2+ Years</option>
                                </select>
                              </div>
                              <div>
                                <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Availability to Join *</label>
                                <select required value={form.availability} onChange={e => set("availability", e.target.value)}
                                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring">
                                  <option>Immediately</option>
                                  <option>After 1 Month</option>
                                  <option>After 2 Months</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Key Skills *</label>
                              <input required value={form.skills} onChange={e => set("skills", e.target.value)}
                                placeholder="React, Node.js, Python..."
                                className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                            </div>

                            <div>
                              <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Resume PDF Link *</label>
                              <input required type="url" value={form.resumeUrl} onChange={e => set("resumeUrl", e.target.value)}
                                placeholder="Google Drive / Dropbox link"
                                className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                            </div>

                            <div>
                              <label className="mono block text-[10px] uppercase tracking-widest text-ink-mute">Cover Letter (Optional)</label>
                              <textarea value={form.coverLetter} onChange={e => set("coverLetter", e.target.value)}
                                rows={3} placeholder="Why are you a good fit?"
                                className="mt-1.5 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring" />
                            </div>

                            {error && (
                              <div className="rounded-md bg-red-50 p-3 text-[13px] text-red-600">{error}</div>
                            )}

                            <div className="pt-2">
                              <button type="submit" disabled={submitting || !isAuthenticated}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[14px] font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-50">
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? "Submitting Application..." : "Submit Application"}
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* RIGHT PANEL: INTERNSHIP DETAILS */}
                        <div className="hidden w-[400px] flex-col bg-secondary/30 p-8 md:flex overflow-y-auto custom-scrollbar">
                          <div className="flex justify-end">
                            <Dialog.Close asChild>
                              <button className="rounded-full p-2 text-ink-mute hover:bg-ink/10 hover:text-ink">
                                <X className="h-5 w-5" />
                              </button>
                            </Dialog.Close>
                          </div>
                          
                          <div className="mt-2 inline-flex w-max items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                               style={{ background: "var(--amber-soft)", color: "var(--ink)" }}>
                            {internship.type}
                          </div>
                          <h3 className="mt-4 text-3xl font-bold leading-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                            {internship.title}
                          </h3>
                          
                          <div className="mt-5 space-y-3">
                            <div className="flex items-center gap-2 text-[13.5px] text-ink-soft">
                              <MapPin className="h-4 w-4 opacity-60" /> {internship.locationType}
                            </div>
                            <div className="flex items-center gap-2 text-[13.5px] text-ink-soft">
                              <Calendar className="h-4 w-4 opacity-60" /> {internship.duration}
                            </div>
                            <div className="flex items-center gap-2 text-[13.5px] text-ink-soft">
                              <Briefcase className="h-4 w-4 opacity-60" /> {internship.stipend || "Unpaid"}
                            </div>
                          </div>

                          <div className="mt-8 border-t border-ink/5 pt-6">
                            <h4 className="font-bold text-ink">Description</h4>
                            <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">
                              {internship.description}
                            </p>
                          </div>

                          {internship.responsibilities && (
                            <div className="mt-6 border-t border-ink/5 pt-6">
                              <h4 className="font-bold text-ink">Responsibilities</h4>
                              <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">
                                {internship.responsibilities}
                              </p>
                            </div>
                          )}

                          {internship.perks && internship.perks.length > 0 && (
                            <div className="mt-6 border-t border-ink/5 pt-6">
                              <h4 className="font-bold text-ink">Perks & Benefits</h4>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {internship.perks.map((perk: string) => (
                                  <span key={perk} className="inline-flex items-center rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                                    {perk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
