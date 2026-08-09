import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase, Plus, Trash2, Pencil, Check, X, Users, Award, FileText,
  Shield, User, Mail, Phone, MapPin, GraduationCap, BookOpen, Calendar,
  Star, ExternalLink, ChevronRight, Loader2, Search, CheckCircle2,
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
import type { Internship } from "@/lib/types";
import {
  listInternships, saveInternship, deleteInternship,
  listInternshipApplications, updateInternshipApplicationStatus,
  issueCertificate, getIssuedCertificates, listAssessments,
  type Application,
} from "@/lib/api";

export const Route = createFileRoute("/internships")({
  head: () => ({ meta: [{ title: "Internships — Enginow Panel" }] }),
  component: InternshipsPage,
});

const DEFAULT_PERKS = [
  "Certificate of Completion",
  "Letter of Experience (LOE)",
  "Remote Work Opportunity",
  "Mentorship Sessions",
  "Letter of Recommendation (LOR)",
  "Flexible Timing",
  "Pre-Placement Offer (PPO)",
  "Letter of Appreciation (LOA)",
  "Performance Incentives",
];

const DOMAINS = [
  "Web Development", "App Development", "UI/UX Design", "Data Science",
  "AI & ML", "Marketing", "Social Media", "Cyber Security",
  "Content Writing", "Business Development", "Other",
];

const EMPTY_FORM: Partial<Internship> = {
  title: "", company: "Enginow", location: "Remote", type: "Summer",
  domain: "Web Development", stipend: "Unpaid", duration: "2 Months",
  description: "", responsibilities: "", requirements: [],
  perks: ["Certificate of Completion", "Letter of Experience (LOE)", "Remote Work Opportunity", "Flexible Timing"],
  tags: "", status: "live",
};

// ─── Status config for applications ──────────────────────────────────────────

const APP_STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  shortlisted:{ label: "Shortlisted",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
  oa:         { label: "OA Sent",      cls: "bg-purple-50 text-purple-700 border-purple-200" },
  "oa-cleared": { label: "OA Cleared",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "oa-failed":  { label: "OA Failed",    cls: "bg-red-50 text-red-700 border-red-200" },
  selected:   { label: "Selected",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected:   { label: "Not Selected", cls: "bg-red-50 text-red-700 border-red-200" },
};

function AppStatusBadge({ status }: { status: string }) {
  const cfg = APP_STATUS_CFG[status] ?? APP_STATUS_CFG['pending']!;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Certificate panel (shown for selected applicants) ────────────────────────

const CERT_TYPES = [
  { value: "completion", label: "Certificate of Completion", icon: Award },
  { value: "lor",        label: "Letter of Recommendation (LOR)", icon: FileText },
  { value: "loe",        label: "Letter of Experience (LOE)", icon: Shield },
];

function CertificatePanel({ applicationId }: { applicationId: string }) {
  const [issuing, setIssuing] = useState<string | null>(null);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState("");
  const qc = useQueryClient();

  const { data: certs = [] } = useQuery({
    queryKey: ["app-certs", applicationId],
    queryFn: () => getIssuedCertificates(applicationId),
  });

  const certsArr = certs as any[];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFileBase64((reader.result as string).split(",")[1] || "");
    reader.readAsDataURL(file);
  };

  const handleIssue = async (type: string) => {
    setIssuing(type);
    try {
      await issueCertificate(applicationId, type, fileBase64 || undefined);
      qc.invalidateQueries({ queryKey: ["app-certs", applicationId] });
      toast.success("Document issued successfully");
      setDrafting(null);
      setFileBase64("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIssuing(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Issue Documents</p>
      {CERT_TYPES.map(({ value, label, icon: Icon }) => {
        const cert = certsArr.find((c: any) => c.type === value);
        const issued = !!cert;
        return (
          <div key={value} className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[13px] font-semibold">{label}</p>
                  {cert && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      ID: <span className="font-mono font-bold">{cert.certificateId}</span>
                      {" · "}{new Date(cert.issuedAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
              {issued ? (() => {
                const webUrl = import.meta.env.VITE_MAIN_WEB_URL || "http://localhost:3000";
                return (
                <a href={`${webUrl}/certificate/${cert.certificateId}`} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50">
                  <ExternalLink className="h-3 w-3" /> View
                </a>
                );
              })() : drafting === value ? (
                <button onClick={() => { setDrafting(null); setFileBase64(""); }}
                  className="shrink-0 text-[12px] text-muted-foreground hover:text-foreground font-medium">Cancel</button>
              ) : (
                <button onClick={() => setDrafting(value)} disabled={!!issuing}
                  className="shrink-0 rounded-full bg-foreground text-background px-4 py-1.5 text-[12px] font-semibold hover:opacity-90 disabled:opacity-50">
                  Issue…
                </button>
              )}
            </div>
            {drafting === value && !issued && (
              <div className="border-t bg-muted/30 px-4 py-4">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Upload Document (optional)</p>
                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange}
                  className="block w-full text-[12px] text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer" />
                <p className="text-[11.5px] mt-2 mb-3 text-muted-foreground">
                  Skip uploading to use the standard Enginow template.
                </p>
                <button onClick={() => handleIssue(value)} disabled={!!issuing}
                  className="w-full inline-flex justify-center items-center rounded-lg px-3 py-2 text-[13px] font-bold bg-amber-400 text-foreground hover:bg-amber-500 disabled:opacity-50">
                  {issuing === value ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Issue Document"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
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
    a => a.listingType === "internship" && a.listingId === app.internshipId
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
            Applied for {app.internshipTitle || "Internship"}
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
              {(["pending", "shortlisted", "oa", "oa-cleared", "oa-failed", "selected", "rejected"] as const).map(s => (
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
            {/* OA Assessment Picker */}
            {pendingOA && (
              <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-3">
                <p className="text-[12px] font-semibold text-purple-800">Select an assessment to send with OA</p>
                {oaAssessments.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground">No assessments linked to this internship. <a href="/assessments" className="text-primary underline">Create one first.</a></p>
                ) : (
                  <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
                    <SelectTrigger className="h-8 text-sm bg-white">
                      <SelectValue placeholder="Pick assessment…" />
                    </SelectTrigger>
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

          {/* Verification Actions */}
          {app.status === "oa" && app.assessmentId && app.hasCompletedOA && (
            <div className="rounded-xl border bg-purple-50/50 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-purple-900">Assessment Submitted</h4>
              <p className="text-xs text-purple-700/80">The applicant has completed their online assessment. Review the detailed analysis before updating their status.</p>
              <Button 
                onClick={() => window.open(`/oa-result/${app.assessmentId}/${app.userId ?? app.email}?appId=${app.id}&appType=internship`, '_blank')}
                className="w-full gap-2"
                style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)", color: "#fff" }}
              >
                <CheckCircle2 className="h-4 w-4" /> Verify OA Result
              </Button>
            </div>
          )}

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
              {app.availability && <div className="flex items-center gap-2 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{app.availability}</div>}
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
              {app.semester       && <div className="flex items-center gap-2 text-sm"><Star className="h-3.5 w-3.5 text-muted-foreground shrink-0" />Semester: {app.semester}</div>}
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

          {/* Certificate Issuing — only for selected */}
          {app.status === "selected" && (
            <>
              <hr />
              <CertificatePanel applicationId={app.id} />
            </>
          )}
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
    queryKey: ["internship-applications"],
    queryFn: () => listInternshipApplications(),
  });

  const apps = applications as Application[];
  const filtered = apps.filter((a) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || [a.fullName, a.email, a.internshipTitle, a.college, a.skills]
      .some((v) => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (id: string, status: string, assessmentId?: string) => {
    await updateInternshipApplicationStatus(id, status, assessmentId);
    qc.invalidateQueries({ queryKey: ["internship-applications"] });
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(["all", "pending", "shortlisted", "oa", "oa-cleared", "oa-failed", "selected", "rejected"] as const).map(s => (
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
                  <p className="truncate text-sm font-medium">{app.internshipTitle}</p>
                  <p className="truncate text-xs text-muted-foreground">{app.internshipDomain}</p>
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

function InternshipsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"listings" | "applications">("listings");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Internship> & { id?: string }>(EMPTY_FORM);
  const [customPerk, setCustomPerk] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: internships = [], isPending } = useQuery({
    queryKey: ["admin-internships"],
    queryFn: listInternships,
  });

  const saveMut = useMutation({
    mutationFn: saveInternship,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-internships"] });
      toast.success(editing.id ? "Internship updated" : "Internship created");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteInternship,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-internships"] });
      toast.success("Internship deleted");
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

  const cols: Column<Internship>[] = [
    {
      key: "title", header: "Title", sortValue: (r) => r.title,
      cell: (r) => (
        <div>
          <span className="font-medium text-foreground">{r.title}</span>
          {r.domain && <span className="ml-2 inline-block rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{r.domain}</span>}
        </div>
      ),
    },
    { key: "company", header: "Company", cell: (r) => r.company, sortValue: (r) => r.company },
    { key: "location", header: "Location", cell: (r) => r.location, sortValue: (r) => r.location },
    { key: "duration", header: "Duration", cell: (r) => r.duration, sortValue: (r) => r.duration },
    { key: "stipend", header: "Stipend", cell: (r) => r.stipend || "Unpaid" },
    {
      key: "applicants", header: "Applicants", sortValue: (r) => r.applicantsCount || 0,
      cell: (r) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {r.applicantsCount || 0}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status || "live"} /> },
    {
      key: "actions", header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => {
            setEditing({ ...r, perks: Array.isArray(r.perks) ? r.perks : [], requirements: Array.isArray(r.requirements) ? r.requirements : [] });
            setOpen(true);
          }}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const req = Array.isArray(editing.requirements) ? editing.requirements : [];

  return (
    <div>
      <PageHeader
        title="Internships"
        subtitle="Manage internship listings and review applications."
        helpTitle="About Internships"
        helpLines={[
          "Create and edit internship opportunities with structured perks, responsibilities, and requirements.",
          "Switch to the Applications tab to review applicants, update their status, and issue certificates.",
          "Only selected applicants can receive documents like certificates, LOR, or LOE.",
        ]}
        actions={
          tab === "listings" ? (
            <Button onClick={() => { setEditing(EMPTY_FORM); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Internship
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
          <Briefcase className="h-4 w-4" /> Listings
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
              <p className="text-sm text-muted-foreground">Loading internships…</p>
            ) : (
              <DataTable
                rows={internships}
                columns={cols}
                rowKey={(r) => r.id}
                searchPlaceholder="Search by title, company, or domain"
                searchIn={(r) => `${r.title} ${r.company} ${r.domain || ""} ${r.type}`}
                emptyState={<EmptyState icon={Briefcase} message="No internship listings found. Click 'Add Internship' to create one." />}
              />
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>{editing.id ? "Edit Internship" : "New Internship"}</SheetTitle>
                <SheetDescription>Configure internship details, perks, and requirements.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5 px-1 pb-8">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={editing.title ?? ""} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Full Stack Developer Intern" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Company</Label>
                    <Input value={editing.company ?? ""} onChange={(e) => setEditing((p) => ({ ...p, company: e.target.value }))} placeholder="Enginow" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Domain</Label>
                    <Select value={editing.domain ?? "Web Development"} onValueChange={(v) => setEditing((p) => ({ ...p, domain: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={editing.type ?? "Summer"} onValueChange={(v) => setEditing((p) => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Summer", "Winter", "Monsoon", "Spring", "Remote", "Virtual"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Select value={editing.location ?? "Remote"} onValueChange={(v) => setEditing((p) => ({ ...p, location: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Remote", "Onsite", "Hybrid"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Stipend</Label>
                    <Input value={editing.stipend ?? ""} onChange={(e) => setEditing((p) => ({ ...p, stipend: e.target.value }))} placeholder="e.g. Unpaid or ₹5,000/mo" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Duration</Label>
                    <Input value={editing.duration ?? ""} onChange={(e) => setEditing((p) => ({ ...p, duration: e.target.value }))} placeholder="e.g. 2 Months" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editing.status ?? "live"} onValueChange={(v) => setEditing((p) => ({ ...p, status: v as Internship["status"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live / Open for Applications</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Closed / Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 rounded-lg border p-3.5 bg-muted/20">
                  <Label className="font-semibold text-sm">Perks & Benefits Tags</Label>
                  <p className="text-xs text-muted-foreground">Click to toggle perks that will be displayed on the listing.</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {DEFAULT_PERKS.map((perk) => {
                      const isSelected = (editing.perks || []).includes(perk);
                      return (
                        <button key={perk} type="button" onClick={() => togglePerk(perk)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                            isSelected ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          }`}>
                          {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          {perk}
                        </button>
                      );
                    })}
                  </div>
                  {(editing.perks || []).filter((p) => !DEFAULT_PERKS.includes(p)).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(editing.perks || []).filter((p) => !DEFAULT_PERKS.includes(p)).map((perk) => (
                        <span key={perk} className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 text-xs font-medium">
                          {perk}
                          <button type="button" onClick={() => togglePerk(perk)} className="hover:opacity-75"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Input size={1} value={customPerk} onChange={(e) => setCustomPerk(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomPerk(); } }}
                      placeholder="Add custom perk..." className="h-8 text-xs" />
                    <Button type="button" size="sm" variant="secondary" className="h-8 text-xs" onClick={addCustomPerk}>Add</Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} placeholder="Overview of the internship..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Responsibilities (one per line)</Label>
                  <Textarea rows={3} value={editing.responsibilities ?? ""} onChange={(e) => setEditing((p) => ({ ...p, responsibilities: e.target.value }))} placeholder="Build responsive UI with React&#10;Collaborate with design team" />
                </div>
                <div className="space-y-1.5">
                  <Label>Requirements & Skills (one per line)</Label>
                  <Textarea rows={3} value={req.join("\n")}
                    onChange={(e) => setEditing((p) => ({ ...p, requirements: e.target.value.split("\n").filter(Boolean) }))}
                    placeholder="Proficiency in React / TypeScript&#10;Familiarity with Git" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tags / Search Keywords (comma-separated)</Label>
                  <Input value={editing.tags ?? ""} onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value }))} placeholder="React, TypeScript, Frontend" />
                </div>

                <Button className="w-full" onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending || !editing.title}>
                  {saveMut.isPending ? "Saving…" : editing.id ? "Save Changes" : "Create Internship"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <ConfirmDialog
            open={!!deleteId}
            onOpenChange={(o) => !o && setDeleteId(null)}
            title="Delete internship?"
            consequence="This will permanently remove the listing from the platform."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); }}
          />
        </>
      ) : (
        <ApplicationsTab />
      )}
    </div>
  );
}
