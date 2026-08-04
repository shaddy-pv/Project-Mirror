import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Plus, Trash2, Pencil, Check, X, Users,
  User, Mail, Phone, MapPin, GraduationCap, BookOpen, Calendar,
  Star, ExternalLink, ChevronRight, Loader2, Search, Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { EmptyState } from "@/components/panel/EmptyState";
import { PageHeader } from "@/components/panel/PageHeader";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { ConfirmDialog } from "@/components/panel/ConfirmDialog";
import type { Career } from "@/lib/types";
import {
  listCareers, saveCareer, deleteCareer,
  listCareerApplications, updateCareerApplicationStatus, listAssessments,
  type Application,
} from "@/mocks/api";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [{ title: "Careers — Enginow Panel" }] }),
  component: CareersPage,
});

const DEFAULT_PERKS = [
  "Paid Time Off (PTO)",
  "Health Insurance",
  "Remote Work Options",
  "Stock Options / Equity",
  "Flexible Hours",
  "Learning Stipend",
  "Performance Bonus",
  "Gym / Wellness Allowance",
  "Annual Company Retreat",
];

const DOMAINS = [
  "Web Development",
  "Mobile App Development",
  "Backend & Cloud",
  "DevOps & Infrastructure",
  "UI/UX Design",
  "Data Science & AI",
  "Product Management",
  "Sales & Marketing",
  "Human Resources",
  "Other",
];

const EMPTY_FORM: Partial<Career> = {
  title: "",
  company: "Enginow",
  location: "Onsite",
  type: "Full-time",
  domain: "Web Development",
  salary: "Competitive",
  description: "",
  responsibilities: "",
  requirements: [],
  perks: [
    "Health Insurance",
    "Remote Work Options",
    "Paid Time Off (PTO)",
    "Flexible Hours",
  ],
  tags: "",
  status: "live",
};

// ─── Status config for applications ──────────────────────────────────────────

const APP_STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  shortlisted:{ label: "Shortlisted",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
  oa:         { label: "OA Sent",      cls: "bg-purple-50 text-purple-700 border-purple-200" },
  interview:  { label: "Interview",    cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  selected:   { label: "Selected",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected:   { label: "Not Selected", cls: "bg-red-50 text-red-600 border-red-200" },
};

function AppStatusBadge({ status }: { status: string }) {
  const cfg = APP_STATUS_CFG[status] ?? APP_STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Applicant Detail Sheet ───────────────────────────────────────────────────

function ApplicantSheet({ app, onClose, onStatusChange }: {
  app: Application; onClose: () => void;
  onStatusChange: (id: string, status: string, assessmentId?: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const [pendingOA, setPendingOA] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");

  const { data: allAssessments = [] } = useQuery({
    queryKey: ["assessments"],
    queryFn: listAssessments,
    enabled: pendingOA,
  });
  const oaAssessments = (allAssessments as any[]).filter(
    a => a.listingType === "career" && a.listingId === app.careerId
  );

  const handle = async (status: string, assessmentId?: string) => {
    setUpdating(true);
    try { await onStatusChange(app.id, status, assessmentId); }
    finally { setUpdating(false); setPendingOA(false); setSelectedAssessmentId(""); }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{app.fullName || "Applicant"}</SheetTitle>
          <SheetDescription>
            Applied for {app.careerTitle || "Career Position"}
            {app.appliedAt ? ` · ${new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5 px-1 pb-8">
          {/* Status */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AppStatusBadge status={app.status} />
              <span className="text-[12px] text-muted-foreground">Current status</span>
            </div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Update to</p>
            <div className="flex flex-wrap gap-2">
              {(["pending", "shortlisted", "oa", "interview", "selected", "rejected"] as const).map(s => (
                s === "oa" ? (
                  <button key={s}
                    onClick={() => { setPendingOA(true); setSelectedAssessmentId(""); }}
                    disabled={updating || app.status === s}
                    className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 ${APP_STATUS_CFG[s]?.cls}`}>
                    {APP_STATUS_CFG[s]?.label}
                  </button>
                ) : (
                  <button key={s} onClick={() => handle(s)} disabled={updating || app.status === s}
                    className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 ${APP_STATUS_CFG[s]?.cls}`}>
                    {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : APP_STATUS_CFG[s]?.label}
                  </button>
                )
              ))}
            </div>
            {pendingOA && (
              <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-3">
                <p className="text-[12px] font-semibold text-purple-800">Select an assessment to send with OA</p>
                {oaAssessments.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground">No assessments linked to this career. <a href="/assessments" className="text-primary underline">Create one first.</a></p>
                ) : (
                  <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
                    <SelectTrigger className="h-8 text-sm bg-white"><SelectValue placeholder="Pick assessment…" /></SelectTrigger>
                    <SelectContent>
                      {oaAssessments.map((a: any) => (
                        <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex gap-2">
                  <Button size="sm" disabled={!selectedAssessmentId || updating}
                    onClick={() => handle("oa", selectedAssessmentId)}
                    className="gap-1.5 flex-1 text-xs bg-purple-700 hover:bg-purple-800">
                    {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Confirm & Send OA
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setPendingOA(false)} className="text-xs">Cancel</Button>
                </div>
              </div>
            )}
          </div>

          <hr />

          {/* Personal */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Personal</p>
            <div className="space-y-2.5">
              {app.fullName     && <div className="flex items-center gap-2 text-sm"><User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{app.fullName}</div>}
              {app.email        && <div className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{app.email}</div>}
              {app.phone        && <div className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{app.phone}</div>}
              {app.cityState    && <div className="flex items-center gap-2 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{app.cityState}</div>}
              {app.experience   && <div className="flex items-center gap-2 text-sm"><Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{app.experience}</div>}
              {app.linkedin && (
                <a href={app.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" /> LinkedIn
                </a>
              )}
              {app.github && (
                <a href={app.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" /> GitHub
                </a>
              )}
            </div>
          </div>

          <hr />

          {/* Education */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Education</p>
            <div className="space-y-2.5">
              {app.education      && <div className="flex items-center gap-2 text-sm"><GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{app.education}</div>}
              {app.college        && <div className="flex items-center gap-2 text-sm"><BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{app.college}</div>}
              {app.graduationYear && <div className="flex items-center gap-2 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />Graduation: {app.graduationYear}</div>}
              {app.cgpa           && <div className="flex items-center gap-2 text-sm"><Star className="h-3.5 w-3.5 text-muted-foreground shrink-0" />CGPA: {app.cgpa}</div>}
              {app.skills         && <div className="flex items-center gap-2 text-sm"><Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{app.skills}</div>}
            </div>
          </div>

          <hr />

          {/* Documents */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Submitted Documents</p>
            {app.resumeUrl ? (
              <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline mb-3">
                <ExternalLink className="h-3.5 w-3.5" /> View Resume
              </a>
            ) : (
              <p className="text-[13px] text-muted-foreground mb-3">No resume submitted</p>
            )}
            {app.coverLetter && (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Cover Letter</p>
                <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-muted-foreground">{app.coverLetter}</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────

function ApplicationsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["career-applications"],
    queryFn: () => listCareerApplications(),
  });

  const apps = applications as Application[];
  const filtered = apps.filter((a) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || [a.fullName, a.email, a.careerTitle, a.college, a.skills]
      .some((v) => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (id: string, status: string, assessmentId?: string) => {
    await updateCareerApplicationStatus(id, status, assessmentId);
    qc.invalidateQueries({ queryKey: ["career-applications"] });
    if (selectedApp?.id === id) setSelectedApp((p) => p ? { ...p, status: status as any } : null);
    toast.success("Status updated");
  };

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, college…"
            className="bg-transparent outline-none placeholder:text-muted-foreground flex-1 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", "pending", "shortlisted", "interview", "selected", "rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? "bg-foreground text-background border-foreground" : "hover:border-foreground/30"
              }`}>
              {s === "all" ? "All" : APP_STATUS_CFG[s]?.label ?? s}
              {" "}({s === "all" ? apps.length : apps.filter((a) => a.status === s).length})
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading applications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground">
            No applications found.
          </div>
        ) : (
          filtered.map((app) => (
            <button key={app.id} onClick={() => setSelectedApp(app)} className="w-full text-left">
              <div className="flex items-center gap-4 rounded-xl border bg-card px-5 py-4 transition-all hover:border-foreground/20 hover:shadow-sm">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold">
                  {(app.fullName || "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold">{app.fullName || "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">{app.email}</p>
                </div>
                <div className="hidden sm:block flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{app.careerTitle}</p>
                  <p className="truncate text-xs text-muted-foreground">{app.careerDomain}</p>
                </div>
                <div className="hidden md:block text-xs text-muted-foreground whitespace-nowrap">
                  {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                </div>
                <AppStatusBadge status={app.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))
        )}
      </div>

      {selectedApp && (
        <ApplicantSheet
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function CareersPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"listings" | "applications">("listings");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Career> & { id?: string }>(EMPTY_FORM);
  const [customPerk, setCustomPerk] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: careers = [], isPending } = useQuery({
    queryKey: ["admin-careers"],
    queryFn: listCareers,
  });

  const saveMut = useMutation({
    mutationFn: saveCareer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-careers"] });
      toast.success(editing.id ? "Job opening updated" : "Job opening created");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCareer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-careers"] });
      toast.success("Job opening deleted");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePerk = (perk: string) => {
    const current = editing.perks || [];
    if (current.includes(perk)) {
      setEditing((p) => ({ ...p, perks: current.filter((x) => x !== perk) }));
    } else {
      setEditing((p) => ({ ...p, perks: [...current, perk] }));
    }
  };

  const addCustomPerk = () => {
    if (!customPerk.trim()) return;
    const current = editing.perks || [];
    if (!current.includes(customPerk.trim())) {
      setEditing((p) => ({ ...p, perks: [...current, customPerk.trim()] }));
    }
    setCustomPerk("");
  };

  const cols: Column<Career>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title,
      cell: (r) => (
        <div>
          <span className="font-medium text-foreground">{r.title}</span>
          {r.domain && (
            <span className="ml-2 inline-block rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {r.domain}
            </span>
          )}
        </div>
      ),
    },
    { key: "company", header: "Company", cell: (r) => r.company, sortValue: (r) => r.company },
    { key: "location", header: "Location", cell: (r) => r.location, sortValue: (r) => r.location },
    { key: "type", header: "Type", cell: (r) => r.type, sortValue: (r) => r.type },
    { key: "salary", header: "Salary", cell: (r) => r.salary ?? "Competitive", sortValue: (r) => r.salary ?? "" },
    {
      key: "applicants",
      header: "Applicants",
      sortValue: (r) => r.applicantsCount || 0,
      cell: (r) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {r.applicantsCount || 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status || "live"} />,
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setEditing({
                ...r,
                perks: Array.isArray(r.perks) ? r.perks : [],
                requirements: Array.isArray(r.requirements) ? r.requirements : [],
              });
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteId(r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const req = Array.isArray(editing.requirements) ? editing.requirements : [];

  return (
    <div>
      <PageHeader
        title="Careers"
        subtitle="Manage job openings and review career applications."
        helpTitle="About Careers"
        helpLines={[
          "Post full-time, part-time and freelance job opportunities with structured perks and requirements.",
          "Switch to the Applications tab to review candidates and update their status.",
        ]}
        actions={
          tab === "listings" ? (
            <Button
              onClick={() => {
                setEditing(EMPTY_FORM);
                setOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Job Opening
            </Button>
          ) : undefined
        }
      />

      {/* Tab toggle */}
      <div className="mt-2 flex gap-1 rounded-lg border bg-muted p-1 w-fit">
        <button
          onClick={() => setTab("listings")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            tab === "listings" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" /> Listings
        </button>
        <button
          onClick={() => setTab("applications")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            tab === "applications" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" /> Applications
        </button>
      </div>

      {tab === "listings" ? (
        <>
          <div className="mt-4">
            {isPending ? (
              <p className="text-sm text-muted-foreground">Loading career openings…</p>
            ) : (
              <DataTable
                rows={careers}
                columns={cols}
                rowKey={(r) => r.id}
                searchPlaceholder="Search by title, domain, or location"
                searchIn={(r) => `${r.title} ${r.company} ${r.domain || ""} ${r.location}`}
                emptyState={
                  <EmptyState
                    icon={Building2}
                    message="No job openings found. Click 'Add Job Opening' to create one."
                  />
                }
              />
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>{editing.id ? "Edit Job Opening" : "New Job Opening"}</SheetTitle>
                <SheetDescription>Fill in the role details, perks, and responsibilities.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5 px-1 pb-8">
                <div className="space-y-1.5">
                  <Label>Job Title</Label>
                  <Input
                    value={editing.title ?? ""}
                    onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Junior Software Developer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Company</Label>
                    <Input
                      value={editing.company ?? ""}
                      onChange={(e) => setEditing((p) => ({ ...p, company: e.target.value }))}
                      placeholder="Enginow"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Domain</Label>
                    <Select
                      value={editing.domain ?? "Web Development"}
                      onValueChange={(v) => setEditing((p) => ({ ...p, domain: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DOMAINS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Salary / Comp</Label>
                    <Input
                      value={editing.salary ?? ""}
                      onChange={(e) => setEditing((p) => ({ ...p, salary: e.target.value }))}
                      placeholder="e.g. ₹6-10 LPA"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Job Type</Label>
                    <Select
                      value={editing.type ?? "Full-time"}
                      onValueChange={(v) => setEditing((p) => ({ ...p, type: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Full-time", "Part-time", "Contract", "Freelance", "Remote"].map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Select
                      value={editing.location ?? "Onsite"}
                      onValueChange={(v) => setEditing((p) => ({ ...p, location: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Onsite", "Remote", "Hybrid"].map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select
                      value={editing.status ?? "live"}
                      onValueChange={(v) => setEditing((p) => ({ ...p, status: v as Career["status"] }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live / Open</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Closed / Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Perks Selection */}
                <div className="space-y-2 rounded-lg border p-3.5 bg-muted/20">
                  <Label className="font-semibold text-sm">Perks & Compensation Benefits</Label>
                  <p className="text-xs text-muted-foreground">Click to toggle benefits tags shown on the job post.</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {DEFAULT_PERKS.map((perk) => {
                      const isSelected = (editing.perks || []).includes(perk);
                      return (
                        <button
                          key={perk}
                          type="button"
                          onClick={() => togglePerk(perk)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          }`}
                        >
                          {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          {perk}
                        </button>
                      );
                    })}
                  </div>

                  {/* Any custom perks added */}
                  {(editing.perks || []).filter((p) => !DEFAULT_PERKS.includes(p)).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(editing.perks || [])
                        .filter((p) => !DEFAULT_PERKS.includes(p))
                        .map((perk) => (
                          <span
                            key={perk}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 text-xs font-medium"
                          >
                            {perk}
                            <button
                              type="button"
                              onClick={() => togglePerk(perk)}
                              className="hover:opacity-75"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Input
                      size={1}
                      value={customPerk}
                      onChange={(e) => setCustomPerk(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomPerk();
                        }
                      }}
                      placeholder="Add custom perk..."
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={addCustomPerk}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={editing.description ?? ""}
                    onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Overview of the company and role..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Key Responsibilities (one per line)</Label>
                  <Textarea
                    rows={3}
                    value={editing.responsibilities ?? ""}
                    onChange={(e) => setEditing((p) => ({ ...p, responsibilities: e.target.value }))}
                    placeholder="Design and implement core frontend features&#10;Optimize application for maximum speed and scalability&#10;Conduct code reviews"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Requirements & Qualifications (one per line)</Label>
                  <Textarea
                    rows={3}
                    value={req.join("\n")}
                    onChange={(e) =>
                      setEditing((p) => ({
                        ...p,
                        requirements: e.target.value.split("\n").filter(Boolean),
                      }))
                    }
                    placeholder="2+ years experience with React and TypeScript&#10;Strong understanding of RESTful APIs&#10;Experience with state management"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Skills / Keywords (comma-separated)</Label>
                  <Input
                    value={editing.tags ?? ""}
                    onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="React, Next.js, TypeScript, TailwindCSS"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => saveMut.mutate(editing)}
                  disabled={saveMut.isPending || !editing.title}
                >
                  {saveMut.isPending ? "Saving…" : editing.id ? "Save Changes" : "Create Job Opening"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <ConfirmDialog
            open={!!deleteId}
            onOpenChange={(o) => !o && setDeleteId(null)}
            title="Delete job opening?"
            consequence="This will permanently remove the career listing from the website."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={() => {
              if (deleteId) deleteMut.mutate(deleteId);
            }}
          />
        </>
      ) : (
        <ApplicationsTab />
      )}
    </div>
  );
}
