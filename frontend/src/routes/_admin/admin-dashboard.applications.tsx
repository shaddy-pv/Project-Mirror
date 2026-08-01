import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Loader2, CheckCircle2, XCircle, Clock3, User, Mail, Phone, MapPin,
  Briefcase, GraduationCap, ExternalLink, Github, Linkedin, BookOpen,
  Calendar, Star, Search, Award, FileText, Shield, ChevronRight
} from "lucide-react";
import {
  adminListApplications,
  adminUpdateApplicationStatus,
  adminIssueCertificate,
  adminGetCertificates,
} from "@/lib/admin.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Drawer } from "@/components/Drawer";

export const Route = createFileRoute("/_admin/admin-dashboard/applications")({
  component: ApplicationsPage,
});

interface Certificate {
  id: string;
  certificateId: string;
  type: "completion" | "lor" | "loe";
  issuedAt: string;
  verifyUrl: string;
  recipientName: string;
  internshipTitle: string;
}

interface Application {
  id: string;
  internshipTitle: string;
  internshipDomain: string;
  internshipType: string;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
  fullName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  cityState?: string;
  experience?: string;
  education?: string;
  college?: string;
  graduationYear?: string;
  semester?: string;
  cgpa?: string;
  skills?: string;
  availability?: string;
  resumeUrl?: string;
  coverLetter?: string;
}

const STATUS_CONFIG = {
  pending:  { label: "Under Review", color: "bg-amber-50 text-amber-700 border-amber-200",     dot: "bg-amber-400",    icon: Clock3 },
  accepted: { label: "Accepted",     color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500",  icon: CheckCircle2 },
  rejected: { label: "Not Selected", color: "bg-red-50 text-red-600 border-red-200",           dot: "bg-red-400",      icon: XCircle },
};

const CERT_TYPES = [
  { value: "completion", label: "Certificate of Completion", icon: Award },
  { value: "lor",        label: "Letter of Recommendation (LOR)", icon: FileText },
  { value: "loe",        label: "Letter of Experience (LOE)", icon: Shield },
];

function StatusBadge({ status }: { status: "pending" | "accepted" | "rejected" }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Divider() {
  return <div className="my-5" style={{ height: "0.8px", background: "rgba(21,23,28,0.08)" }} />;
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-mute" />
      <div className="min-w-0">
        <span className="mono block text-[9px] uppercase tracking-widest text-ink-mute">{label}</span>
        <span className="mt-0.5 block text-[13px] text-ink break-words">{value}</span>
      </div>
    </div>
  );
}

function CertificatePanel({ applicationId }: { applicationId: string }) {
  const queryClient = useQueryClient();
  const [issuing, setIssuing] = useState<string | null>(null);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["admin-certs", applicationId],
    queryFn: () => adminGetCertificates(applicationId),
  });

  const certificates = certs as Certificate[];
  const issuedTypes = certificates.map(c => c.type);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileBase64("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setFileBase64(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleIssue = async (type: string) => {
    setIssuing(type);
    try {
      await adminIssueCertificate({ data: { applicationId, type, customDocumentBase64: fileBase64 || undefined } });
      queryClient.invalidateQueries({ queryKey: ["admin-certs", applicationId] });
      setDrafting(null);
      setFileBase64("");
    } finally {
      setIssuing(null);
    }
  };

  return (
    <div>
      <p className="mono text-[9.5px] uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--ink-mute)" }}>Issue Documents</p>
      {isLoading ? (
        <div className="flex items-center gap-2 text-[13px] text-ink-mute"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : (
        <div className="space-y-3">
          {CERT_TYPES.map(({ value, label, icon: Icon }) => {
            const issued = issuedTypes.includes(value as any);
            const cert = certificates.find(c => c.type === value);
            return (
              <div key={value} className={`flex flex-col gap-0 rounded-xl border transition-colors ${issued ? "border-emerald-200 bg-emerald-50/50" : "border-input bg-paper"}`}>
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 ${issued ? "text-emerald-600" : "text-ink-mute"}`} />
                    <div>
                      <p className="text-[13px] font-medium text-ink">{label}</p>
                      {cert && (
                        <p className="text-[10.5px] text-ink-mute mt-0.5">
                          ID: <span className="font-mono font-bold">{cert.certificateId}</span> · {new Date(cert.issuedAt).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                  {issued && cert ? (
                    <a
                      href={`/certificate/${cert.certificateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-full bg-white border border-emerald-200 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> View
                    </a>
                  ) : drafting === value ? (
                    <button onClick={() => { setDrafting(null); setFileBase64(""); }} className="shrink-0 text-ink-mute text-[12px] hover:text-ink font-medium">Cancel</button>
                  ) : (
                    <button
                      onClick={() => setDrafting(value)}
                      disabled={!!issuing}
                      className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors bg-ink text-paper hover:bg-ink/90 disabled:opacity-50"
                    >
                      Issue…
                    </button>
                  )}
                </div>

                {/* Inline upload form when issuing */}
                {drafting === value && !issued && (
                  <div className="border-t border-input px-4 py-4 bg-gray-50/50 rounded-b-xl">
                    <p className="mono text-[9.5px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--ink-mute)" }}>Upload Certificate Document</p>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={handleFileChange} 
                      className="block w-full text-[12px] text-ink-mute file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer" 
                    />
                    <p className="text-[11.5px] mt-2.5 mb-4" style={{ color: "var(--ink-soft)" }}>
                      If you skip uploading, a standard Enginow template will be generated.
                    </p>
                    <button 
                      onClick={() => handleIssue(value)} 
                      disabled={!!issuing} 
                      className="w-full inline-flex justify-center items-center rounded-lg px-3 py-2 text-[13px] font-bold transition-colors disabled:opacity-50"
                      style={{ background: "var(--amber)", color: "var(--ink)" }}
                    >
                      {issuing === value ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Issue Document"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ApplicationDrawer({ app, onClose, onStatusChange }: { app: Application; onClose: () => void; onStatusChange: (id: string, status: string) => Promise<void> }) {
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status: string) => {
    setUpdating(true);
    await onStatusChange(app.id, status);
    setUpdating(false);
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title={app.fullName || "Applicant Details"}
      subtitle={`Applied for ${app.internshipTitle} · ${new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
      width="580px"
    >
      <div>
        {/* Current status + update */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status={app.status} />
            <span className="text-[12px] text-ink-mute">Current status</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <p className="w-full mono text-[9px] uppercase tracking-widest text-ink-mute mb-1">Update to:</p>
            {(["pending", "accepted", "rejected"] as const).map(s => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => handleStatus(s)}
                  disabled={updating || app.status === s}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 ${cfg.color}`}
                >
                  {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <cfg.icon className="h-3 w-3" />}
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Personal */}
        <p className="mono text-[9.5px] uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--ink-mute)" }}>Personal</p>
        <div className="space-y-2.5">
          <DetailRow icon={User}      label="Full Name"    value={app.fullName} />
          <DetailRow icon={Mail}      label="Email"        value={app.email} />
          <DetailRow icon={Phone}     label="Phone"        value={app.phone} />
          <DetailRow icon={MapPin}    label="Location"     value={app.cityState} />
          <DetailRow icon={Briefcase} label="Experience"   value={app.experience} />
          <DetailRow icon={Calendar}  label="Availability" value={app.availability} />
          <DetailRow icon={Linkedin}  label="LinkedIn"     value={app.linkedin} />
          <DetailRow icon={Github}    label="GitHub"       value={app.github} />
        </div>

        <Divider />

        {/* Education */}
        <p className="mono text-[9.5px] uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--ink-mute)" }}>Education</p>
        <div className="space-y-2.5">
          <DetailRow icon={GraduationCap} label="Highest Education" value={app.education} />
          <DetailRow icon={BookOpen}      label="College"           value={app.college} />
          <DetailRow icon={Calendar}      label="Graduation Year"   value={app.graduationYear} />
          <DetailRow icon={Star}          label="Current Semester"  value={app.semester} />
          <DetailRow icon={Star}          label="CGPA"              value={app.cgpa} />
          <DetailRow icon={Briefcase}     label="Skills"            value={app.skills} />
        </div>

        <Divider />

        {/* Resume + Cover Letter */}
        <p className="mono text-[9.5px] uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--ink-mute)" }}>Documents</p>
        {app.resumeUrl ? (
          <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink hover:underline mb-3">
            <ExternalLink className="h-3.5 w-3.5" /> View Resume
          </a>
        ) : (
          <p className="text-[13px] text-ink-mute mb-3">No resume submitted</p>
        )}
        {app.coverLetter && (
          <div>
            <p className="mono text-[9px] uppercase tracking-widest text-ink-mute mb-1">Cover Letter</p>
            <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-soft">{app.coverLetter}</p>
          </div>
        )}

        {/* Certificate issuing — only accepted */}
        {app.status === "accepted" && (
          <>
            <Divider />
            <CertificatePanel applicationId={app.id} />
          </>
        )}
      </div>
    </Drawer>
  );
}

function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => adminListApplications(),
  });

  const apps = applications as Application[];

  const filtered = apps.filter(app => {
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      app.fullName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.internshipTitle?.toLowerCase().includes(q) ||
      app.college?.toLowerCase().includes(q) ||
      app.skills?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    all: apps.length,
    pending: apps.filter(a => a.status === "pending").length,
    accepted: apps.filter(a => a.status === "accepted").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };

  const handleStatusChange = async (id: string, status: string) => {
    await adminUpdateApplicationStatus({ data: { id, status } });
    queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    // Update the selected app in-place so drawer reflects new status
    if (selectedApp?.id === id) {
      setSelectedApp(prev => prev ? { ...prev, status: status as any } : null);
    }
  };

  return (
    <div className="px-8 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Internship Applications</h1>
        <p className="mt-1 text-[13px] text-ink-mute">{apps.length} total · click any row to view full details</p>
      </div>

      {/* Status pills */}
      <div className="mt-8 flex flex-wrap gap-2">
        {(["all", "pending", "accepted", "rejected"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-[12.5px] font-medium capitalize transition-colors border ${statusFilter === s ? "bg-ink text-paper border-ink" : "bg-paper text-ink-soft border-input hover:border-ink/30 hover:text-ink"}`}>
            {s === "all" ? "All" : STATUS_CONFIG[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mt-5 flex items-center gap-2 rounded-lg border border-input bg-paper px-3 py-2 max-w-sm focus-within:ring-1 focus-within:ring-ring">
        <Search className="h-4 w-4 text-ink-mute shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, college, skills…"
          className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-ink-mute" />
      </div>

      {/* List */}
      <div className="mt-6 space-y-2">
        {isLoading ? (
          <div className="flex items-center gap-2 py-16 text-ink-mute justify-center">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading applications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-input bg-paper py-16 text-center text-[14px] text-ink-mute">No applications found.</div>
        ) : (
          filtered.map((app, i) => (
            <motion.button
              key={app.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.03 }}
              onClick={() => setSelectedApp(app)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-4 rounded-xl border border-input bg-paper px-5 py-4 transition-all hover:border-ink/20 hover:shadow-sm">
                {/* Avatar */}
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-[13px] font-bold text-ink-soft">
                  {(app.fullName || "?")[0]?.toUpperCase()}
                </div>
                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink">{app.fullName || "—"}</p>
                  <p className="truncate text-[12px] text-ink-mute">{app.email || "No email"}</p>
                </div>
                {/* Internship */}
                <div className="hidden sm:block flex-1 min-w-0">
                  <p className="truncate text-[13px] text-ink font-medium">{app.internshipTitle}</p>
                  <p className="truncate text-[11.5px] text-ink-mute">{app.internshipDomain}</p>
                </div>
                {/* Date */}
                <div className="hidden md:block text-[12px] text-ink-mute whitespace-nowrap">
                  {new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <StatusBadge status={app.status} />
                <ChevronRight className="h-4 w-4 text-ink-mute shrink-0" />
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Drawer */}
      {selectedApp && (
        <ApplicationDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
