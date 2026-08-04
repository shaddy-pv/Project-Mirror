"use client";
import { useParams } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import { Award, FileText, Shield, Printer, Share2, XCircle, Loader2, ExternalLink } from "lucide-react";

export default function CertificateViewPage() {
  const { certificateId } = useParams() as { certificateId: string };

  const { data: cert, isLoading, isError } = useQuery({
    queryKey: ["view-cert", certificateId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/internships/certificate/view/${certificateId}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    }
  });

  const CERT_LABELS: Record<string, { title: string; body: string; icon: any }> = {
    completion: {
      title: "Certificate of Completion",
      body: "has successfully completed the internship program and demonstrated outstanding dedication, technical skills, and professional conduct.",
      icon: Award,
    },
    lor: {
      title: "Letter of Recommendation",
      body: "is hereby recommended by Enginow for their exceptional performance, work ethic, and contribution during the internship program. We confidently recommend them for future academic and professional pursuits.",
      icon: FileText,
    },
    loe: {
      title: "Letter of Experience",
      body: "has gained hands-on professional experience through our internship program, developing practical skills in their domain of expertise.",
      icon: Shield,
    },
    offer: {
      title: "Offer Letter",
      body: "has been selected to join the internship program at Enginow. We look forward to a productive and enriching experience together.",
      icon: FileText,
    },
  };

  const meta = cert ? (CERT_LABELS[cert.type] ?? CERT_LABELS.completion) : null;
  const Icon = meta?.icon ?? Award;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#f5f0e8" }}>
        <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "#f5f0e8" }}>
        <XCircle className="h-12 w-12 text-red-400" />
        <h1 className="text-2xl font-bold text-gray-900">Document not found</h1>
        <p className="text-gray-500">The document ID <code className="font-mono font-bold">{certificateId}</code> does not exist or has been revoked.</p>
      </div>
    );
  }

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "#f5f0e8" }}>
      {/* Action bar */}
      <div className="mx-auto mb-6 flex max-w-[760px] items-center justify-between">
        <a href="/" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">← Back to Enginow</a>
        <div className="flex items-center gap-2">
          <a
            href={`/verify/${certificateId}`}
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors hover:bg-white text-gray-700"
            style={{ borderColor: "rgba(21,23,28,0.15)" }}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Verify
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors hover:bg-white text-gray-700"
            style={{ borderColor: "rgba(21,23,28,0.15)" }}
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors hover:bg-white text-gray-700"
            style={{ borderColor: "rgba(21,23,28,0.15)" }}
          >
            <Share2 className="h-3.5 w-3.5" /> Copy link
          </button>
        </div>
      </div>

      {/* If custom PDF/image uploaded — show that */}
      {cert.customDocumentBase64 ? (
        <div className="mx-auto max-w-[900px] bg-white rounded-xl shadow-sm border p-2" style={{ borderColor: "rgba(21,23,28,0.1)" }}>
          {cert.customDocumentBase64.startsWith("data:image/") ? (
            <img src={cert.customDocumentBase64} alt="Document" className="w-full h-auto rounded-lg block" />
          ) : (
            <iframe src={cert.customDocumentBase64} className="w-full rounded-lg block" style={{ height: "85vh", border: "none" }} title="Document" />
          )}
        </div>
      ) : (
        /* Otherwise render the beautiful styled certificate */
        <div
          className="mx-auto max-w-[760px] print:max-w-none"
          style={{
            background: "#fffdf5",
            border: "8px solid #c8a84b",
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(21,23,28,0.12), inset 0 0 0 2px rgba(200,168,75,0.3)",
            padding: "52px 56px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Corner ornaments */}
          {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map(pos => (
            <div key={pos} className={`absolute ${pos} h-8 w-8 rounded-sm`} style={{ border: "2px solid rgba(200,168,75,0.5)" }} />
          ))}

          {/* Watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
            <span style={{ fontSize: 120, fontWeight: 900, color: "#c8a84b", letterSpacing: -4 }}>ENGINOW</span>
          </div>

          {/* Header */}
          <div className="relative text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="grid h-12 w-12 place-items-center rounded-full" style={{ background: "rgba(200,168,75,0.15)", border: "1.5px solid #c8a84b" }}>
                <Icon className="h-6 w-6" style={{ color: "#966d10" }} />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "#966d10", fontFamily: "monospace" }}>Enginow</p>
                <p className="text-[11px] text-gray-500">Ed-Tech & Internship Platform</p>
              </div>
            </div>
            <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 32, fontWeight: 700, color: "#15171C", letterSpacing: "0.01em" }}>
              {meta?.title}
            </h1>
            <div className="mt-3 mx-auto h-0.5 w-20" style={{ background: "#c8a84b" }} />
          </div>

          {/* Body */}
          <div className="relative text-center mb-10">
            <p style={{ fontSize: 14, color: "rgba(21,23,28,0.55)", letterSpacing: "0.04em", textTransform: "uppercase" }}>This is to certify that</p>
            <p style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 42,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#15171C",
              marginTop: 8,
              marginBottom: 8,
              lineHeight: 1.2,
            }}>
              {cert.recipientName}
            </p>
            <p style={{ fontSize: 15, color: "rgba(21,23,28,0.7)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              {meta?.body}
            </p>
            {(cert.internshipDomain || cert.internshipTitle) && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.4)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#966d10" }}>Domain: {cert.internshipDomain || cert.internshipTitle}</span>
              </div>
            )}
          </div>

          {/* Signatures + Date row */}
          <div className="relative flex items-end justify-between mt-12 pt-6" style={{ borderTop: "1px solid rgba(200,168,75,0.3)" }}>
            {/* Left — signature block */}
            <div className="text-left">
              <div style={{ height: 40, borderBottom: "1.5px solid #15171C", width: 160, marginBottom: 6 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: "#15171C" }}>Authorised Signatory</p>
              <p style={{ fontSize: 11, color: "rgba(21,23,28,0.5)" }}>Enginow</p>
            </div>

            {/* Center — date */}
            <div className="text-center">
              <p style={{ fontSize: 11, color: "rgba(21,23,28,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Date of Issue</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#15171C", marginTop: 4 }}>{issuedDate}</p>
            </div>

            {/* Right — cert ID */}
            <div className="text-right">
              <p style={{ fontSize: 9, color: "rgba(21,23,28,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Document ID</p>
              <p style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#15171C" }}>{cert.certificateId}</p>
            </div>
          </div>

          {/* Verify footer */}
          <div className="relative mt-8 pt-4 text-center" style={{ borderTop: "1px dashed rgba(200,168,75,0.4)" }}>
            <p style={{ fontSize: 11, color: "rgba(21,23,28,0.45)" }}>
              Verify this document at{" "}
              <a href={`/verify/${cert.certificateId}`} target="_blank" rel="noopener noreferrer" style={{ color: "#966d10", textDecoration: "underline" }}>
                enginow.in/verify/{cert.certificateId}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
