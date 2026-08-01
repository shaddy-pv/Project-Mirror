import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, Award, FileText, Shield, ExternalLink, Calendar, User, Briefcase } from "lucide-react";


export const Route = createFileRoute("/verify/$certificateId")({
  component: VerifyPage,
  head: ({ params }) => ({
    meta: [
      { title: `Verify Certificate ${params.certificateId} — Enginow` },
    ],
  }),
});

const CERT_LABELS: Record<string, { title: string; icon: any }> = {
  completion: { title: "Certificate of Completion", icon: Award },
  lor:        { title: "Letter of Recommendation",  icon: FileText },
  loe:        { title: "Letter of Experience",       icon: Shield },
};

function VerifyPage() {
  const { certificateId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["verify-cert", certificateId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/internships/certificate/verify/${certificateId}`);
      return res.json();
    },
  });

  const valid = data?.valid;
  const cert = data?.certificate;
  const meta = cert ? (CERT_LABELS[cert.type] ?? CERT_LABELS.completion) : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      {/* Top bar */}
      <header className="px-6 py-4 border-b" style={{ borderColor: "rgba(21,23,28,0.08)", background: "#fff" }}>
        <div className="mx-auto max-w-[640px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-paper text-[13px] font-medium">E</span>
            <span className="text-[14px] font-semibold tracking-tight" style={{ color: "var(--ink)" }}>Enginow</span>
          </Link>
          <span className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>Certificate Verification</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[560px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--ink-mute)" }} />
              <p className="text-[15px]" style={{ color: "var(--ink-mute)" }}>Verifying certificate…</p>
            </div>
          ) : valid ? (
            <div className="space-y-6">
              {/* Valid banner */}
              <div className="flex items-start gap-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-5">
                <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-[16px] font-bold text-emerald-800">Certificate Verified ✓</p>
                  <p className="mt-1 text-[13px] text-emerald-700">This is an authentic document issued by Enginow.</p>
                </div>
              </div>

              {/* Certificate details card */}
              <div className="rounded-2xl border bg-white p-6 space-y-5" style={{ borderColor: "rgba(21,23,28,0.10)" }}>
                <div className="flex items-center gap-3">
                  {meta && <meta.icon className="h-6 w-6" style={{ color: "#966d10" }} />}
                  <div>
                    <p className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>Document Type</p>
                    <p className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>{meta?.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2.5">
                    <User className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--ink-mute)" }} />
                    <div>
                      <p className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>Recipient</p>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{cert.recipientName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--ink-mute)" }} />
                    <div>
                      <p className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>Internship</p>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{cert.internshipTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--ink-mute)" }} />
                    <div>
                      <p className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>Date Issued</p>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                        {new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Award className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--ink-mute)" }} />
                    <div>
                      <p className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>Domain</p>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{cert.internshipDomain || "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl px-4 py-3" style={{ background: "rgba(21,23,28,0.03)", border: "0.8px solid rgba(21,23,28,0.08)" }}>
                  <p className="mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--ink-mute)" }}>Certificate ID</p>
                  <p className="font-mono text-[14px] font-bold tracking-wider" style={{ color: "var(--ink)" }}>{cert.certificateId}</p>
                </div>

                <a
                  href={`/certificate/${cert.certificateId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-[14px] font-semibold transition-colors"
                  style={{ background: "var(--ink)", color: "#fff" }}
                >
                  <ExternalLink className="h-4 w-4" /> View Full Certificate
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Invalid banner */}
              <div className="flex items-start gap-4 rounded-2xl bg-red-50 border border-red-200 px-5 py-5">
                <XCircle className="h-8 w-8 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="text-[16px] font-bold text-red-800">Certificate Not Found</p>
                  <p className="mt-1 text-[13px] text-red-700">
                    We couldn't verify <code className="font-mono font-bold">{certificateId}</code>. This document may not exist or may have been revoked.
                  </p>
                </div>
              </div>
              <div className="text-center">
                <Link to="/" className="text-[13px] font-medium" style={{ color: "var(--ink-mute)" }}>← Back to Enginow</Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-5 text-center border-t" style={{ borderColor: "rgba(21,23,28,0.08)", background: "#fff" }}>
        <p className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>
          Powered by Enginow · All documents are digitally authenticated
        </p>
      </footer>
    </div>
  );
}
