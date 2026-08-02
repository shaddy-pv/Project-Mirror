"use client";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useState } from "react";
import { Shield, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";



export default function VerifyIndexPage() {
  const [certId, setCertId] = useState("");
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    router.push(`/verify/${certId.trim()}`);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#FFFFFF" }}>
      {/* Background decorations */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", pointerEvents: "none", background: "radial-gradient(circle at 50% -20%, rgba(200,168,75,0.15) 0%, transparent 60%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.05 }} />

      <div className="absolute left-6 top-6 md:left-10 md:top-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] transition-colors" style={{ color: "var(--ink-mute)" }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] text-center relative z-10"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full mb-8 shadow-sm" style={{ background: "var(--amber)", border: "0.8px solid rgba(21,23,28,0.10)" }}>
          <Shield className="h-7 w-7" style={{ color: "var(--ink)" }} />
        </div>

        <h1 className="display text-3xl md:text-4xl mb-4" style={{ color: "var(--ink)" }}>Verify Document</h1>
        <p className="text-[15px] mb-8" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
          Enter the unique Certificate ID to verify the authenticity of an Enginow certificate or document.
        </p>

        <form onSubmit={handleVerify} className="glass-shell p-2 rounded-[28px] mx-auto flex items-center shadow-sm">
          <input
            type="text"
            placeholder="e.g. 5x2a9b1"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            className="flex-1 bg-transparent px-5 py-3 outline-none text-[15px] font-mono tracking-wide placeholder:font-sans placeholder:tracking-normal placeholder:text-ink-mute/50"
            style={{ color: "var(--ink)" }}
            autoFocus
          />
          <button 
            type="submit" 
            disabled={!certId.trim()}
            className="btn-primary rounded-[20px] px-6 py-3 ml-2 disabled:opacity-50"
          >
            Verify <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        
        <p className="mt-8 text-[12px] opacity-70" style={{ color: "var(--ink-mute)" }}>
          You can find the Certificate ID at the bottom of the document or embedded in its QR code.
        </p>
      </motion.div>
    </main>
  );
}
