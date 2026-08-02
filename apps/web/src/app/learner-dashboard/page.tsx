"use client";
﻿import Link from "next/link";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  BookOpen, Layers, ArrowRight, Clock, ArrowLeft, Check, Share2, Trophy,
  TrendingUp, Star, Briefcase, MapPin, Calendar, Award, CheckCircle2, XCircle,
  Clock3, ExternalLink, FileText, Shield, Lock, ChevronRight, ShoppingBag, Package
} from "lucide-react";
import { getMyEnrollments, getMyProfile } from "@/lib/courses.functions";
import { getMyInternshipApplications } from "@/lib/internships.functions";
import { getMyCareerApplications } from "@/lib/careers.functions";
import { getMyOrders, rateOrder } from "@/lib/shop.functions";
import { useAuthContext } from "@/providers/auth-provider";
import { useState } from "react";
import { Drawer } from "@/components/Drawer";

interface EnrollmentItem {
  id: string;
  progress: number;
  courseId: string;
  enrolledAt: string;
  courses: { id: string; slug: string; title: string; level: string; duration?: string | null; bannerUrl?: string | null } | null;
}

interface Certificate {
  id: string;
  certificateId: string;
  type: "completion" | "lor" | "loe";
  issuedAt: string;
  verifyUrl: string;
  internshipTitle: string;
  recipientName: string;
}

interface ApplicationItem {
  id: string;
  internshipId?: string;
  careerId?: string;
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
  certificates?: Certificate[];
  internship?: {
    id: string;
    title: string;
    domain: string;
    locationType: string;
    duration: string;
    stipend: string;
    type: string;
    perks: string[];
  };
  career?: {
    id: string;
    title: string;
    domain: string;
    locationType: string;
    type: string;
  };
}

const enrollmentsQueryOptions = queryOptions({
  queryKey: ["enrollments"],
  queryFn: () => getMyEnrollments()
});

const STATUS_CONFIG = {
  pending:  { label: "Under Review", color: "bg-amber-50 text-amber-700",    dot: "bg-amber-400",    icon: Clock3 },
  accepted: { label: "Accepted",     color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500",  icon: CheckCircle2 },
  rejected: { label: "Not Selected", color: "bg-red-50 text-red-600",        dot: "bg-red-400",      icon: XCircle },
};

const CERT_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  completion: { label: "Certificate of Completion", icon: Award },
  lor:        { label: "Letter of Recommendation",  icon: FileText },
  loe:        { label: "Letter of Experience",       icon: Shield },
};

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="glass-shell">
      <div className="glass-card" style={{ borderRadius: "23px" }}>
        <div className="flex items-start justify-between">
          <span className="mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--ink-mute)" }}>{label}</span>
          <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: accent ?? "var(--amber)", border: "0.8px solid rgba(21,23,28,0.08)" }}>
            <Icon className="h-3.5 w-3.5" style={{ color: "var(--ink)" }} />
          </span>
        </div>
        <p className="mt-3 display text-4xl" style={{ color: "var(--ink)" }}>{value}</p>
      </div>
    </motion.div>
  );
}


function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>{label}</p>
      <p className="mt-0.5 text-[13px] break-words" style={{ color: "var(--ink)" }}>{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mono text-[9.5px] uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--ink-mute)" }}>{title}</p>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-5" style={{ height: "0.8px", background: "rgba(21,23,28,0.08)" }} />;
}

function ApplicationDetailDrawer({ app, onClose }: { app: ApplicationItem; onClose: () => void }) {
  const isAccepted = app.status === "accepted";
  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  return (
    <Drawer
      open
      onClose={onClose}
      title={app.internship?.title ?? app.career?.title ?? "Application"}
      subtitle={`Applied ${new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`}
      width="560px"
    >
      <div className="space-y-0">
        {/* Status banner */}
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-5 ${cfg.color}`} style={{ border: `0.8px solid currentColor`, opacity: 1 }}>
          <StatusIcon className="h-4 w-4 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold">{cfg.label}</p>
            <p className="text-[12px] opacity-80">
              {app.status === "pending" && "Your application is under review. We'll notify you soon."}
              {app.status === "accepted" && "Congratulations! You've been selected for this internship."}
              {app.status === "rejected" && "Thank you for applying. We'll keep your profile for future opportunities."}
            </p>
          </div>
        </div>

        {/* Internship info */}
        <Section title="Details">
          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="Domain"   value={app.internship?.domain ?? app.career?.domain} />
            <DetailRow label="Location" value={app.internship?.locationType ?? app.career?.locationType} />
            <DetailRow label="Duration" value={app.internship?.duration} />
            <DetailRow label="Stipend"  value={app.internship?.stipend} />
          </div>
          {(app.internship?.perks ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {app.internship!.perks.map(p => (
                <span key={p} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                  <Check className="h-3 w-3" /> {p}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Divider />

        {/* Submitted details */}
        <Section title="What You Submitted">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <DetailRow label="Full Name"    value={app.fullName} />
            <DetailRow label="Email"        value={app.email} />
            <DetailRow label="Phone"        value={app.phone} />
            <DetailRow label="Location"     value={app.cityState} />
            <DetailRow label="Experience"   value={app.experience} />
            <DetailRow label="Availability" value={app.availability} />
            <DetailRow label="Education"    value={app.education} />
            <DetailRow label="College"      value={app.college} />
            <DetailRow label="Grad Year"    value={app.graduationYear} />
            <DetailRow label="Semester"     value={app.semester} />
            <DetailRow label="CGPA"         value={app.cgpa} />
            <DetailRow label="LinkedIn"     value={app.linkedin} />
            <DetailRow label="GitHub"       value={app.github} />
          </div>
          {app.skills && (
            <div className="mt-3">
              <DetailRow label="Skills" value={app.skills} />
            </div>
          )}
          {app.resumeUrl && (
            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "var(--ink)" }}>
              <ExternalLink className="h-3.5 w-3.5" /> View submitted resume
            </a>
          )}
          {app.coverLetter && (
            <div className="mt-4">
              <p className="mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--ink-mute)" }}>Cover Letter</p>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--ink-soft)" }}>{app.coverLetter}</p>
            </div>
          )}
        </Section>

        {/* Certificates ΓÇö only if accepted */}
        {isAccepted && (
          <>
            <Divider />
            <Section title="Documents & Certificates">
              {(app.certificates ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 px-5 py-8 text-center">
                  <Award className="mx-auto h-8 w-8 text-amber-300 mb-2" />
                  <p className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>Certificates issued after completion</p>
                  <p className="mt-1 text-[12px]" style={{ color: "var(--ink-mute)" }}>
                    HR will upload your certificate and documents here once your internship is complete.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(app.certificates ?? []).map(cert => {
                    const meta = CERT_TYPE_LABELS[cert.type] ?? { label: "Document", icon: FileText };
                    const Icon = meta.icon;
                    return (
                      <div key={cert.id} className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3" style={{ borderColor: "rgba(200,168,75,0.4)", background: "rgba(255,248,234,0.6)" }}>
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: "var(--amber)" }}>
                            <Icon className="h-4 w-4" style={{ color: "var(--ink)" }} />
                          </span>
                          <div>
                            <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{meta.label}</p>
                            <p className="mono text-[10px]" style={{ color: "var(--ink-mute)" }}>
                              {cert.certificateId} ┬╖ {new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`/certificate/${cert.certificateId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors hover:opacity-80"
                          style={{ background: "var(--ink)", color: "#fff" }}
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          </>
        )}

        {/* Lock notice for non-accepted */}
        {!isAccepted && (
          <>
            <Divider />
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(21,23,28,0.04)", border: "0.8px solid rgba(21,23,28,0.08)" }}>
              <Lock className="h-4 w-4 shrink-0" style={{ color: "var(--ink-mute)" }} />
              <p className="text-[12.5px]" style={{ color: "var(--ink-mute)" }}>
                Certificates and documents will be available after your application is accepted.
              </p>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

export default function DashboardPage() {
  const { data: enrollments } = useSuspenseQuery(enrollmentsQueryOptions);
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => getMyProfile() });
  const { data: applications } = useQuery({ queryKey: ["my-applications"], queryFn: () => getMyInternshipApplications() });
  const { data: careerApps = [] } = useQuery({ queryKey: ["my-career-applications"], queryFn: () => getMyCareerApplications() });
  const { data: myOrders = [] } = useQuery({ queryKey: ["my-orders"], queryFn: () => getMyOrders() });
  const auth = useAuthContext();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"courses" | "internships" | "careers" | "orders">("courses");
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  function copyRefLink() {
    if (!profile?.referralCode) return;
    const url = `${window.location.origin}/courses?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }

  const inProgress = (enrollments as EnrollmentItem[]).filter((e) => e.progress > 0 && e.progress < 100);
  const completed = (enrollments as EnrollmentItem[]).filter((e) => e.progress >= 100);
  const apps = (applications ?? []) as ApplicationItem[];

  return (
    <main className="relative min-h-screen" style={{ background: "#FFFFFF" }}>
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "500px", pointerEvents: "none", background: "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.38) 0%, rgba(255,248,234,0.12) 55%, transparent 80%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.05 }} />

      {/* Header */}
      <section className="relative px-6 pb-14 pt-24 md:px-10" style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}>
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] transition-colors" style={{ color: "var(--ink-mute)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">ΓÇö Learner surface</span>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="display mt-3 text-4xl md:text-5xl" style={{ color: "var(--ink)" }}>
                {auth.user?.displayName ? <>Hey, <span className="italic-serif" style={{ color: "#B8922E" }}>{auth.user.displayName.split(" ")[0]}</span>.</> : <>Your <span className="italic-serif" style={{ color: "#B8922E" }}>dashboard</span>.</>}
              </motion.h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                Track your learning journey ΓÇö enrolled courses and internship applications, all in one place.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start">
              <Link href="/courses" className="btn-outline inline-flex">Browse courses</Link>
              <Link href="/internship" className="btn-amber inline-flex">Internships <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Enrolled"           value={enrollments.length}  icon={BookOpen} />
            <StatCard label="In progress"        value={inProgress.length}   icon={TrendingUp} accent="var(--tertiary)" />
            <StatCard label="Completed"          value={completed.length}    icon={Trophy} accent="var(--amber-bright)" />
            <StatCard label="Internships Applied" value={apps.length}        icon={Briefcase} accent="var(--moss)" />
          </div>
          {profile?.referralCode && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20, duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="mt-6 glass-shell">
              <div className="glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5" style={{ borderRadius: "23px", background: profile.referralExpired ? "rgba(255,255,255,0.40)" : "rgba(255,232,184,0.25)" }}>
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: "var(--amber)", border: "0.8px solid rgba(21,23,28,0.10)" }}>
                    <Star className="h-4 w-4" style={{ color: "var(--ink)" }} />
                  </span>
                  <div>
                    <p className="mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--ink-mute)" }}>Your Referral Code</p>
                    <p className="mt-1 font-mono text-2xl font-bold tracking-widest" style={{ color: "var(--ink)" }}>{profile.referralCode}</p>
                    <p className="mt-1 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>{profile.referralExpired ? "Your code has reached its 5-use limit." : `${5 - (profile.referralUsageCount ?? 0)} uses left ΓÇö share for 15% off on paid courses`}</p>
                  </div>
                </div>
                <button onClick={copyRefLink} disabled={profile.referralExpired} className="btn-outline shrink-0 disabled:opacity-40">
                  {copied ? <Check className="h-3.5 w-3.5" style={{ color: "var(--moss)" }} /> : <Share2 className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy referral link"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-0 z-10 border-b px-6 md:px-10" style={{ borderColor: "rgba(21,23,28,0.08)", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex max-w-[1440px] gap-0 overflow-x-auto">
          {(["courses", "internships", "careers", "orders"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="relative px-5 py-4 text-[13.5px] font-medium capitalize transition-colors whitespace-nowrap" style={{ color: activeTab === tab ? "var(--ink)" : "var(--ink-mute)" }}>
              {tab === "courses" ? `My Courses (${enrollments.length})` : tab === "internships" ? `My Internships (${apps.length})` : tab === "careers" ? `My Careers (${(careerApps as unknown[]).length})` : `My Orders (${(myOrders as unknown[]).length})`}
              {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "var(--ink)" }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Tab */}
      <section className="relative px-6 py-14 md:px-10" style={{ display: activeTab === "courses" ? "block" : "none" }}>
        <div className="mx-auto max-w-[1440px]">
          {enrollments.length === 0 ? (
            <div className="mx-auto max-w-sm glass-shell text-center">
              <div className="glass-card" style={{ borderRadius: "23px" }}>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--amber)" }}>
                  <BookOpen className="h-6 w-6" style={{ color: "var(--ink)" }} />
                </div>
                <h2 className="display mt-5 text-xl" style={{ color: "var(--ink)" }}>No enrollments yet</h2>
                <p className="mt-2 text-[14px]" style={{ color: "var(--ink-soft)" }}>Explore the curriculum and enroll in your first course.</p>
                <Link href="/courses" className="btn-primary mt-6 inline-flex justify-center">Browse courses <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="display text-xl mb-6" style={{ color: "var(--ink)" }}>My courses</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(enrollments as EnrollmentItem[]).map((enrollment, i) => {
                  const course = enrollment.courses;
                  if (!course) return null;
                  const statusLabel = enrollment.progress === 0 ? "Not started" : enrollment.progress >= 100 ? "Completed" : "In progress";
                  const statusColor = enrollment.progress >= 100 ? "var(--tertiary)" : enrollment.progress > 0 ? "var(--amber)" : "rgba(21,23,28,0.06)";
                  return (
                    <motion.article key={enrollment.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }} className="glass-shell group">
                      <div className="glass-card flex flex-col transition-all group-hover:-translate-y-1" style={{ borderRadius: "23px" }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: statusColor, color: "var(--ink)" }}>{statusLabel}</span>
                            <h2 className="mt-2 text-lg font-bold leading-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>{course.title}</h2>
                          </div>
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl overflow-hidden" style={{ background: "var(--amber-soft)", border: "0.8px solid rgba(21,23,28,0.08)" }}>
                            {course.bannerUrl ? <img src={course.bannerUrl} alt="" className="h-full w-full object-cover" /> : <Layers className="h-5 w-5" style={{ color: "var(--ink-mute)" }} />}
                          </div>
                        </div>
                        <div className="mt-5">
                          <div className="flex items-center justify-between text-[11px] mb-2">
                            <span className="mono uppercase tracking-wider" style={{ color: "var(--ink-mute)" }}>Progress</span>
                            <span className="mono font-bold" style={{ color: "var(--ink)" }}>{enrollment.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(21,23,28,0.08)" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${enrollment.progress}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full" style={{ background: enrollment.progress >= 100 ? "var(--moss)" : "var(--ink)" }} />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[12px]" style={{ color: "var(--ink-mute)" }}>
                          <Clock className="h-3 w-3" /><span>{course.duration}</span><span className="opacity-40">┬╖</span><span>{course.level}</span>
                        </div>
                        <Link href="/learn/$slug" params={{ slug: course.slug }} className="btn-primary mt-5 justify-center">
                          {enrollment.progress === 0 ? "Start course" : "Continue learning"}<ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Internships Tab */}
      <section className="relative px-6 py-14 md:px-10" style={{ display: activeTab === "internships" ? "block" : "none" }}>
        <div className="mx-auto max-w-[1440px]">
          {apps.length === 0 ? (
            <div className="mx-auto max-w-sm glass-shell text-center">
              <div className="glass-card" style={{ borderRadius: "23px" }}>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--amber)" }}>
                  <Briefcase className="h-6 w-6" style={{ color: "var(--ink)" }} />
                </div>
                <h2 className="display mt-5 text-xl" style={{ color: "var(--ink)" }}>No applications yet</h2>
                <p className="mt-2 text-[14px]" style={{ color: "var(--ink-soft)" }}>Explore open internships and submit your first application.</p>
                <Link href="/internship" className="btn-primary mt-6 inline-flex justify-center">Browse internships <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="display text-xl mb-6" style={{ color: "var(--ink)" }}>My Applications</h2>
              <div className="space-y-3">
                {apps.map((app, i) => {
                  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
                  const hasCerts = (app.certificates ?? []).length > 0;
                  return (
                    <motion.button
                      key={app.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => setSelectedApp(app)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all hover:shadow-sm hover:-translate-y-0.5" style={{ background: "#fff", borderColor: "rgba(21,23,28,0.10)" }}>
                        {/* Icon */}
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: app.status === "accepted" ? "rgba(16,185,129,0.10)" : "var(--amber-soft)" }}>
                          <Briefcase className="h-4.5 w-4.5" style={{ color: app.status === "accepted" ? "#059669" : "var(--ink-mute)" }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[14.5px] font-bold" style={{ color: "var(--ink)" }}>{app.internship?.title ?? "Internship"}</p>
                          <div className="mt-0.5 flex items-center gap-3 flex-wrap">
                            {app.internship?.locationType && (
                              <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--ink-mute)" }}>
                                <MapPin className="h-3 w-3" /> {app.internship.locationType}
                              </span>
                            )}
                            {app.internship?.duration && (
                              <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--ink-mute)" }}>
                                <Calendar className="h-3 w-3" /> {app.internship.duration}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--ink-mute)" }}>
                              <Clock3 className="h-3 w-3" />
                              {new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasCerts && (
                            <span className="hidden sm:flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                              <Award className="h-3 w-3" /> {(app.certificates ?? []).length} doc{(app.certificates ?? []).length > 1 ? "s" : ""}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                          </span>
                          <ChevronRight className="h-4 w-4" style={{ color: "var(--ink-mute)" }} />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Careers Tab */}
      <section className="relative px-6 py-14 md:px-10" style={{ display: activeTab === "careers" ? "block" : "none" }}>
        <div className="mx-auto max-w-[1440px]">
          {careerApps.length === 0 ? (
            <div className="mx-auto max-w-sm glass-shell text-center">
              <div className="glass-card" style={{ borderRadius: "23px" }}>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--amber)" }}>
                  <Briefcase className="h-6 w-6" style={{ color: "var(--ink)" }} />
                </div>
                <h2 className="display mt-5 text-xl" style={{ color: "var(--ink)" }}>No job applications yet</h2>
                <p className="mt-2 text-[14px]" style={{ color: "var(--ink-soft)" }}>Explore open roles and submit your first application.</p>
                <Link href="/careers" className="btn-primary mt-6 inline-flex justify-center">Browse careers <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="display text-xl mb-6" style={{ color: "var(--ink)" }}>My Job Applications</h2>
              <div className="space-y-3">
                {careerApps.map((app: ApplicationItem, i: number) => {
                  const cfg = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                  return (
                    <motion.button
                      key={app.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => setSelectedApp(app)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all hover:shadow-sm hover:-translate-y-0.5" style={{ background: "#fff", borderColor: "rgba(21,23,28,0.10)" }}>
                        {/* Icon */}
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: app.status === "accepted" ? "rgba(16,185,129,0.10)" : "var(--amber-soft)" }}>
                          <Briefcase className="h-4.5 w-4.5" style={{ color: app.status === "accepted" ? "#059669" : "var(--ink-mute)" }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[14.5px] font-bold" style={{ color: "var(--ink)" }}>{app.career?.title ?? "Career"}</p>
                          <div className="mt-0.5 flex items-center gap-3 flex-wrap">
                            {app.career?.locationType && (
                              <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--ink-mute)" }}>
                                <MapPin className="h-3 w-3" /> {app.career.locationType}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--ink-mute)" }}>
                              <Clock3 className="h-3 w-3" />
                              {new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                          </span>
                          <ChevronRight className="h-4 w-4" style={{ color: "var(--ink-mute)" }} />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Orders Tab */}
      <section className="relative px-6 py-14 md:px-10" style={{ display: activeTab === "orders" ? "block" : "none" }}>
        <div className="mx-auto max-w-[1440px]">
          {(myOrders as unknown[]).length === 0 ? (
            <div className="mx-auto max-w-sm glass-shell text-center">
              <div className="glass-card" style={{ borderRadius: "23px" }}>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--amber)" }}>
                  <ShoppingBag className="h-6 w-6" style={{ color: "var(--ink)" }} />
                </div>
                <h2 className="display mt-5 text-xl" style={{ color: "var(--ink)" }}>No orders yet</h2>
                <p className="mt-2 text-[14px]" style={{ color: "var(--ink-soft)" }}>Visit the shop to order merchandise.</p>
                <Link href="/shop" className="btn-primary mt-6 inline-flex justify-center">Visit Shop <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="display text-xl mb-6" style={{ color: "var(--ink)" }}>My Orders</h2>
              <div className="space-y-4">
                {(myOrders as { id: string; status: string; trackingId?: string; trackingSite?: string; createdAt: string; productImage?: string; productName?: string; productCategory?: string; address?: { fullAddress: string; city: string; state: string; pincode: string }; amount: number }[]).map((order, i: number) => {
                  const isRecent = !order.trackingId;
                  const orderStatusColor: Record<string, string> = {
                    pending: "bg-amber-50 text-amber-700",
                    paid: "bg-blue-50 text-blue-700",
                    shipped: "bg-purple-50 text-purple-700",
                    delivered: "bg-emerald-50 text-emerald-700",
                    cancelled: "bg-red-50 text-red-600",
                  };
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(21,23,28,0.10)", background: "#fff" }}
                    >
                      {/* Order header */}
                      <div className="flex items-center gap-4 px-5 py-4">
                        {order.productImage ? (
                          <img src={order.productImage} alt={order.productName} className="h-14 w-14 rounded-xl object-cover border hairline shrink-0" />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                            <Package className="h-6 w-6" style={{ color: "var(--ink-mute)" }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>{order.productName}</p>
                          <p className="mono text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "var(--ink-mute)" }}>{order.productCategory}</p>
                          <p className="text-[12px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                            Ordered {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[16px]" style={{ color: "var(--ink)" }}>Γé╣{order.amount}</p>
                          <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${orderStatusColor[order.status] || "bg-secondary text-ink-soft"}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Delivery address */}
                      {order.address && (
                        <div className="px-5 pb-3 border-t hairline pt-3" style={{ borderColor: "rgba(21,23,28,0.06)", background: "rgba(21,23,28,0.02)" }}>
                          <p className="mono text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "var(--ink-mute)" }}>Delivery To</p>
                          <p className="text-[13px]" style={{ color: "var(--ink)" }}>{order.address.fullAddress}</p>
                          <p className="text-[12px]" style={{ color: "var(--ink-soft)" }}>{order.address.city}, {order.address.state} ΓÇö {order.address.pincode}</p>
                        </div>
                      )}

                      {/* Tracking section */}
                      {(!order.trackingId && (order.status === "delivered" || order.status === "cancelled")) ? null : (
                        <div className="px-5 py-4 border-t hairline" style={{ borderColor: "rgba(21,23,28,0.06)", background: "rgba(255,248,234,0.3)" }}>
                          {!order.trackingId ? (
                            <div className="flex items-start gap-3">
                              <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>Tracking ID will be generated soon</p>
                                <p className="text-[12px] mt-0.5" style={{ color: "var(--ink-soft)" }}>Once your order is dispatched, you&apos;ll be able to track your package here.</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="mono text-[9.5px] uppercase tracking-widest mb-2" style={{ color: "var(--ink-mute)" }}>Tracking</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-[14px] font-bold" style={{ color: "var(--ink)" }}>{order.trackingId}</span>
                                {order.trackingSite && (
                                  <a
                                    href={order.trackingSite}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors hover:opacity-80"
                                    style={{ background: "var(--ink)", color: "#fff" }}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> Track Package
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rate Product */}
                      {order.status === "delivered" && (
                        <OrderRateBlock order={order} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Application detail drawer */}
      {selectedApp && <ApplicationDetailDrawer app={selectedApp} onClose={() => setSelectedApp(null)} />}
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrderRateBlock({ order }: { order: any }) {
  const [rating, setRating] = useState(order.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (val: number) => {
    if (order.rating) return; // already rated
    try {
      setIsSubmitting(true);
      await rateOrder(order.id, val);
      setRating(val);
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-4 border-t hairline" style={{ borderColor: "rgba(21,23,28,0.06)", background: "rgba(21,23,28,0.02)" }}>
      <p className="mono text-[9.5px] uppercase tracking-widest mb-2" style={{ color: "var(--ink-mute)" }}>
        {order.rating ? "Your Rating" : "Rate Product"}
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            disabled={!!order.rating || isSubmitting}
            onMouseEnter={() => !order.rating && setHoverRating(star)}
            onMouseLeave={() => !order.rating && setHoverRating(0)}
            onClick={() => handleRate(star)}
            className={`transition-colors ${(hoverRating || rating) >= star ? "text-amber-400" : "text-ink-mute/30"}`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );
}
