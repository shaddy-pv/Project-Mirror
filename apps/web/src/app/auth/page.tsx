"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Loader2, ArrowLeft, Mail, Shield, Zap } from "lucide-react";
import { auth as oauthService } from "@/integrations/oauth";
import { completeUserProfile } from "@/lib/user.functions";
import { sendEmailVerification } from "firebase/auth";



const COURSE_OPTIONS = ["B.Tech", "B.E.", "B.A.", "B.Sc", "B.Com", "BBA", "Other"];
const SPECIALIZATION_OPTIONS = ["CSE", "AI/ML", "ECE", "EE", "CE", "ME", "IT", "Data Science", "Other"];

/* ── Input field helper ─────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mono block text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--ink-mute)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = `block w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-all`;
const inputStyle = {
  background: "rgba(255,255,255,0.60)",
  border: "0.8px solid rgba(21,23,28,0.14)",
  color: "var(--ink)",
  backdropFilter: "blur(8px)",
};

import { Suspense } from 'react';

function AuthContent() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [verificationPending, setVerificationPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [otherCourse, setOtherCourse] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [otherSpecialization, setOtherSpecialization] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const destination = (rawRedirect && rawRedirect.startsWith("/")) ? rawRedirect : "/";

  useEffect(() => {
    const ref = searchParams.get("ref") ?? localStorage.getItem("enginow_ref") ?? "";
    if (ref) {
      // eslint-disable-next-line
      setReferralCode(ref);
      localStorage.setItem("enginow_ref", ref);
    }
  }, [searchParams]);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character.";
    return null;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        const passError = validatePassword(password);
        if (passError) { setError(passError); setLoading(false); return; }
        const { user, error: err } = await oauthService.signUpWithEmail(email, password);
        if (err) throw err;
        if (user) {
          await user.getIdToken(true);
          const finalCourse = course === "Other" ? otherCourse : course;
          const finalSpecialization = specialization === "Other" ? otherSpecialization : specialization;
          await completeUserProfile({ data: { fullName, collegeName, course: finalCourse, specialization: finalSpecialization } });
          await sendEmailVerification(user);
          if (referralCode.trim()) {
            localStorage.setItem("enginow_ref", referralCode.trim());
          }
          setVerificationPending(true);
        }
      } else {
        const { user, error: err } = await oauthService.signInWithEmail(email, password);
        if (err) throw err;
        if (user) {
          if (!user.emailVerified) {
            await oauthService.signOut();
            setError("Please verify your email before signing in. Check your inbox.");
            return;
          }
          router.push(destination);
        }
      }
    } catch (err) {
      setError(friendlyFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);
    try {
      const { user, error: err } = await oauthService.signInWithOAuth(provider);
      if (err) throw err;
      if (user) router.push(destination);
    } catch (err) {
      setError(friendlyFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Email verified pending screen ─────────────────── */
  if (verificationPending) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16" style={{ background: "#FFFFFF" }}>
        {/* Amber haze background */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,232,184,0.45) 0%, rgba(255,248,234,0.15) 50%, transparent 80%)"
        }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.06 }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="glass-shell relative w-full max-w-md"
        >
          <div className="glass-card text-center" style={{ borderRadius: "23px" }}>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--amber)", border: "0.8px solid rgba(21,23,28,0.10)" }}>
              <Mail className="h-6 w-6" style={{ color: "var(--ink)" }} />
            </div>
            <h1 className="display mt-6 text-2xl" style={{ color: "var(--ink)" }}>Check your inbox</h1>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              We&apos;ve sent a verification link to{" "}
              <span className="font-bold" style={{ color: "var(--ink)" }}>{email}</span>.
              Please click the link to verify your account, then sign in.
            </p>
            <button
              onClick={() => { setVerificationPending(false); setMode("signin"); }}
              className="btn-primary mt-8 w-full justify-center"
            >
              Back to sign in
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  /* ── Main auth layout ───────────────────────────────── */
  return (
    <main className="relative flex min-h-screen overflow-hidden" style={{ background: "#FFFFFF" }}>

      {/* ── Left panel — decorative ─────────────────── */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden p-12 lg:flex" style={{ background: "var(--ink)" }}>
        {/* Amber noise haze */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(255,232,184,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(232,255,194,0.08) 0%, transparent 60%)"
        }} />
        {/* Grid */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05,
          backgroundImage: "linear-gradient(to right, rgba(255,232,184,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,232,184,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg text-[14px] font-bold" style={{ background: "var(--amber)", color: "var(--ink)" }}>E</span>
            <span className="text-[18px] font-bold tracking-tight" style={{ fontFamily: "Archivo Variable", color: "#FFF9ED" }}>Enginow</span>
          </div>
        </div>

        <div className="relative space-y-10">
          <div>
            <h2 className="display text-4xl leading-[1.05]" style={{ color: "#FFF9ED" }}>
              Engineering education,<br />
              <span style={{ color: "var(--amber)" }}>done right</span>.
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,249,237,0.60)" }}>
              Courses, cohorts and internships taught by engineers who actually ship.
            </p>
          </div>

          <ul className="space-y-4">
            {( [
              ["Runnable code every chapter", Shield],
              ["Live cohorts, capped at 40", Zap],
              ["Verifiable certificates", Mail],
            ] as [string, React.ElementType][] ).map(([label, Icon]) => (
              <li key={label} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ background: "rgba(255,232,184,0.12)", border: "0.8px solid rgba(255,232,184,0.20)" }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: "var(--amber)" }} />
                </span>
                <span className="text-[13.5px]" style={{ color: "rgba(255,249,237,0.75)" }}>{label}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 pt-2" style={{ borderTop: "0.8px solid rgba(255,232,184,0.10)" }}>
            <div className="flex -space-x-2">
              {["A", "K", "P", "R"].map((l) => (
                <div key={l} className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold" style={{ background: "var(--amber)", color: "var(--ink)", border: "2px solid var(--ink)" }}>{l}</div>
              ))}
            </div>
            <div>
              <div className="text-[13px] font-bold" style={{ color: "#FFF9ED" }}>12,000+ engineers</div>
              <div className="text-[11px]" style={{ color: "rgba(255,249,237,0.50)" }}>learning on Enginow</div>
            </div>
          </div>
        </div>

        <div className="relative mono text-[10px]" style={{ color: "rgba(255,249,237,0.25)" }}>
          enginow.com · v2026.1
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
        {/* Subtle amber tint */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,232,184,0.28) 0%, transparent 60%)"
        }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.05 }} />

        {/* Back link */}
        <Link href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-[13px] transition-colors md:left-10 md:top-10"
          style={{ color: "var(--ink-mute)" }}
          search={{}}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-lg text-[13px] font-bold" style={{ background: "var(--ink)", color: "#FFF9ED" }}>E</span>
            <span className="text-[17px] font-bold tracking-tight" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>Enginow</span>
          </div>

          <h1 className="display text-3xl" style={{ color: "var(--ink)" }}>
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-[13.5px]" style={{ color: "var(--ink-soft)" }}>
            {mode === "signin" ? "Sign in to continue your learning." : "Join thousands of engineers on Enginow."}
          </p>

          {/* OAuth buttons */}
          <div className="mt-7 space-y-2.5">
            <button
              id="btn-google-signin"
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl py-2.5 text-[13.5px] font-bold transition-all hover:-translate-y-px disabled:opacity-60"
              style={{ background: "rgba(255,255,255,0.70)", border: "0.8px solid rgba(21,23,28,0.14)", color: "var(--ink)", backdropFilter: "blur(8px)" }}
            >
              <GoogleIcon className="h-4 w-4" />
              Continue with Google
            </button>
            <button
              id="btn-github-signin"
              onClick={() => handleOAuth("github")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl py-2.5 text-[13.5px] font-bold transition-all hover:-translate-y-px disabled:opacity-60"
              style={{ background: "var(--ink)", border: "0.8px solid rgba(255,232,184,0.20)", color: "#FFF9ED" }}
            >
              <GitHubIcon className="h-4 w-4" />
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: "rgba(21,23,28,0.09)" }} />
            <span className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>or</span>
            <span className="h-px flex-1" style={{ background: "rgba(21,23,28,0.09)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Full Name">
                  <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    className={inputCls} style={inputStyle} placeholder="Jane Doe" />
                </Field>

                <Field label="College / University">
                  <input id="collegeName" type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required
                    className={inputCls} style={inputStyle} placeholder="National Institute of Technology" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Course">
                    <select id="course" value={course} onChange={(e) => setCourse(e.target.value)} required
                      className={`${inputCls} appearance-none`} style={inputStyle}>
                      <option value="" disabled>Select</option>
                      {COURSE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </Field>
                  {course === "Other" ? (
                    <Field label="Specify Course">
                      <input id="otherCourse" type="text" value={otherCourse} onChange={(e) => setOtherCourse(e.target.value)} required
                        className={inputCls} style={inputStyle} placeholder="e.g. BCA" />
                    </Field>
                  ) : (
                    <Field label="Specialization">
                      <select id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required
                        className={`${inputCls} appearance-none`} style={inputStyle}>
                        <option value="" disabled>Select</option>
                        {SPECIALIZATION_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </Field>
                  )}
                </div>

                {course === "Other" && (
                  <Field label="Specialization">
                    <select id="specialization2" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required
                      className={`${inputCls} appearance-none`} style={inputStyle}>
                      <option value="" disabled>Select</option>
                      {SPECIALIZATION_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </Field>
                )}

                {specialization === "Other" && (
                  <Field label="Specify Specialization">
                    <input id="otherSpecialization" type="text" value={otherSpecialization} onChange={(e) => setOtherSpecialization(e.target.value)} required
                      className={inputCls} style={inputStyle} placeholder="e.g. Cybersecurity" />
                  </Field>
                )}

                <Field label={<>Referral Code <span className="normal-case font-normal opacity-60">(optional)</span></> as unknown as string}>
                  <input id="referralCode" type="text" value={referralCode} onChange={(e) => { setReferralCode(e.target.value); localStorage.setItem("enginow_ref", e.target.value); }}
                    className={`${inputCls} font-mono`} style={inputStyle} placeholder="e.g. abc1234" disabled={loading} />
                  {referralCode && (
                    <p className="mt-1.5 text-[11.5px] font-bold" style={{ color: "#4a7c59" }}>🎉 15% off applied on paid courses!</p>
                  )}
                </Field>
              </>
            )}

            <Field label="Email">
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className={inputCls} style={inputStyle} placeholder="you@example.com" />
            </Field>

            <Field label="Password">
              <input id="password" type="password" value={password}
                onChange={(e) => { setPassword(e.target.value); if (mode === "signup" && error) setError(null); }}
                required className={inputCls} style={inputStyle} placeholder="••••••••" />
            </Field>

            {error && (
              <div className="rounded-xl px-4 py-3 text-[13px] leading-tight" style={{ background: "rgba(196,94,46,0.08)", border: "0.8px solid rgba(196,94,46,0.20)", color: "var(--ember)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              id="btn-email-submit"
              disabled={loading}
              className="btn-primary group mt-1 w-full justify-center"
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px]" style={{ color: "var(--ink-soft)" }}>
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
              className="font-bold underline-offset-4 hover:underline"
              style={{ color: "var(--ink)" }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function sanitizeRedirect(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return url.pathname + url.search;
  } catch { return null; }
}

function friendlyFirebaseError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code ?? "";
    const map: Record<string, string> = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password is too weak.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
      "auth/cancelled-popup-request": "Only one sign-in popup can be open at a time.",
      "auth/network-request-failed": "Network error. Please check your connection.",
      "auth/invalid-credential": "Email or password is incorrect.",
    };
    return map[code] ?? err.message;
  }
  return "Something went wrong. Please try again.";
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-ink-mute" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
