"use client";
import { useRouter, useParams, useSearchParams, notFound } from "next/navigation";
import Link from 'next/link';
import { useSuspenseQuery, useQueryClient, useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Layers, CheckCircle, BookOpen, Loader2, ArrowRight, Share2, Check, Lock, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/providers/auth-provider";
import { getTrainingBySlug, enrollInTraining } from "@/lib/trainings.functions";
import { getMyEnrollments, createRazorpayOrder, verifyRazorpayPayment, validateReferralCode, getMyProfile } from "@/lib/courses.functions";

const trainingQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["trainings", "slug", slug],
    queryFn: () => getTrainingBySlug({ data: { slug } })
  });

interface RazorpayResponse { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }
declare global { interface Window { Razorpay: new (options: Record<string, unknown> & { handler: (response: RazorpayResponse) => void; modal?: { ondismiss: () => void } }) => { open: () => void }; } }

import { Suspense } from 'react';

function TrainingContent() {
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const { data: training, isLoading: isTrainingLoading } = useQuery(trainingQueryOptions(slug));
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [enrolling, setEnrolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appliedRef, setAppliedRef] = useState<string | null>(null);
  const [refDiscount, setRefDiscount] = useState(0);
  const [refInput, setRefInput] = useState(refCode || "");
  const [validatingRef, setValidatingRef] = useState(false);
  const [refError, setRefError] = useState("");

  const { data: myEnrollments, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => getMyEnrollments(),
    enabled: isAuthenticated && !isAuthLoading
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
    enabled: isAuthenticated && !isAuthLoading
  });

  useEffect(() => {
    if (refCode) localStorage.setItem("enginow_ref", refCode);
  }, [refCode]);

  useEffect(() => {
    if (!training) return;
    const code = refCode ?? localStorage.getItem("enginow_ref");
    if (!code) return;
    validateReferralCode({ data: { code } }).then((result) => {
      if (result.valid) { setAppliedRef(code); setRefDiscount(result.discountPercent ?? 15); }
    }).catch(() => {});
  }, [refCode, training]);

  if (isTrainingLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#15171C]" />
      </div>
    );
  }

  if (!training) return notFound();

  const isCheckingEnrollment = isAuthLoading || (isAuthenticated && isEnrollmentsLoading);
  const isEnrolled = (myEnrollments as Array<{ trainingId?: string; courseId?: string }>)?.some((e) => e.trainingId === training?.id || e.courseId === training?.id) ?? false;
  const roadmap = Array.isArray(training.roadmap) ? training.roadmap : [];
  const finalPrice = Math.round(training.discountedPrice - (training.discountedPrice * refDiscount / 100));

  async function applyReferralCode() {
    if (!refInput.trim()) return;
    setValidatingRef(true);
    setRefError("");
    try {
      const r = await validateReferralCode({ data: { code: refInput.trim() } });
      if (r.valid) { setAppliedRef(refInput.trim()); setRefDiscount(r.discountPercent ?? 15); }
      else { setRefError("Invalid or expired referral code."); }
    } catch { setRefError("Failed to validate code."); }
    finally { setValidatingRef(false); }
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleEnroll() {
    if (!isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/auth?redirect=/trainings/${training.slug}` as any);
      return;
    }
    setEnrolling(true);
    try {
      const refToUse = appliedRef ?? undefined;
      if (finalPrice > 0) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) { alert("Could not load payment gateway. Please try again."); setEnrolling(false); return; }
        const { id: orderId } = await createRazorpayOrder({ data: { amount: finalPrice } });
        await new Promise<void>((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: finalPrice * 100, currency: "INR",
            name: "Enginow", description: training.title, order_id: orderId,
            handler: async (response: RazorpayResponse) => {
              const { valid } = await verifyRazorpayPayment({ data: { razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature } });
              if (valid) resolve(); else reject(new Error("Payment verification failed"));
            },
            modal: { ondismiss: () => reject(new Error("dismissed")) }
          });
          rzp.open();
        });
      }
      await enrollInTraining({ data: { trainingId: training.id, referralCode: refToUse } });
      localStorage.removeItem("enginow_ref");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/learn/${training.slug}` as any);
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== "dismissed") { console.error(err); alert("Something went wrong. Please try again."); }
    } finally { setEnrolling(false); }
  }

  function handleShare() {
    let url = `${window.location.origin}/courses/${training.slug}`;
    const canRefer = !training.isFree && isAuthenticated && myProfile?.referralCode && !myProfile?.referralExpired;
    if (canRefer) url += `?ref=${myProfile.referralCode}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }

  return (
    <main className="relative min-h-screen" style={{ background: "#FFFFFF" }}>

      {/* Amber haze at top */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "600px", pointerEvents: "none",
        background: "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.38) 0%, rgba(255,248,234,0.12) 55%, transparent 80%)"
      }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.05 }} />

      {/* ── Hero header ─────────────────────────────────── */}
      <section className="relative px-6 pb-16 pt-24 md:px-10" style={{ borderBottom: "0.8px solid rgba(21,23,28,0.09)" }}>
        <div className="mx-auto max-w-[1440px]">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-[13px] transition-colors" style={{ color: "var(--ink-mute)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> All courses
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_420px]">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ background: "var(--amber)", color: "var(--ink)" }}>
                  {training.level}
                </span>
                {training.isFree && (
                  <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ background: "var(--tertiary)", color: "var(--ink)" }}>Free</span>
                )}
                <span className="mono text-[11px] uppercase tracking-wider" style={{ color: "var(--ink-mute)" }}>
                  <Clock className="mr-1 inline h-3 w-3" />{training.duration}
                </span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="display mt-5 max-w-3xl text-4xl md:text-5xl lg:text-6xl"
                style={{ color: "var(--ink)" }}
              >
                {training.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="mt-5 max-w-2xl text-[15px] leading-relaxed"
                style={{ color: "var(--ink-soft)" }}
              >
                {training.description}
              </motion.p>

              {/* Price */}
              <div className="mt-8 flex items-baseline gap-2">
                {training.isFree ? (
                  <span className="display text-3xl" style={{ color: "var(--ink)" }}>Free</span>
                ) : (
                  <>
                    {appliedRef && refDiscount > 0 ? (
                      <>
                        <span className="display text-3xl" style={{ color: "var(--ink)" }}>{formatPrice(finalPrice, false)}</span>
                        <span className="text-[15px] line-through" style={{ color: "var(--ink-mute)" }}>{formatPrice(training.price, false)}</span>
                      </>
                    ) : (
                      <>
                        <span className="display text-3xl" style={{ color: "var(--ink)" }}>{formatPrice(training.discountedPrice, false)}</span>
                        {training.price > training.discountedPrice && (
                          <span className="text-[15px] line-through" style={{ color: "var(--ink-mute)" }}>{formatPrice(training.price, false)}</span>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Referral Code Input */}
              {!training.isFree && !isEnrolled && (
                <div className="mt-4 rounded-xl border hairline bg-secondary/20 p-3 max-w-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-4 w-4 text-amber-500" />
                    <span className="text-[13px] font-medium">Have a referral code?</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={refInput}
                      onChange={(e) => setRefInput(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 rounded-lg border border-input bg-white px-3 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={applyReferralCode}
                      disabled={validatingRef || !!appliedRef}
                      className="rounded-lg bg-ink px-4 py-1.5 text-[13px] font-medium text-paper hover:bg-ink/90 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {validatingRef ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : appliedRef ? <Check className="h-3.5 w-3.5" /> : "Apply"}
                    </button>
                  </div>
                  {refError && <p className="mt-1.5 text-[12px] text-red-500">{refError}</p>}
                  {appliedRef && <p className="mt-1.5 text-[12px] text-emerald-600">Code applied! You save {refDiscount}%</p>}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {isCheckingEnrollment ? (
                  <div className="h-11 w-36 animate-pulse rounded-full" style={{ background: "rgba(21,23,28,0.07)" }} />
                ) : isEnrolled ? (
                  <Link href={`/learn/${training.slug}`}
                    className="btn-amber group inline-flex"
                  >
                    Start Learning <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn-primary group inline-flex disabled:opacity-60"
                  >
                    {enrolling && <Loader2 className="h-4 w-4 animate-spin" />}
                    {enrolling ? "Processing..." : training.isFree ? "Enroll now" : "Buy now"}
                    {!enrolling && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                  </button>
                )}

                {/* Share button */}
                <button
                  onClick={handleShare}
                  className="btn-outline inline-flex"
                >
                  {copied ? <Check className="h-3.5 w-3.5" style={{ color: "var(--moss)" }} /> : <Share2 className="h-3.5 w-3.5" />}
                  {copied ? "Link copied!" : "Share"}
                </button>
              </div>

              {!training.isFree && isAuthenticated && myProfile?.referralExpired && (
                <p className="mt-3 text-[12px]" style={{ color: "var(--ink-mute)" }}>Your referral code has reached its 5-use limit.</p>
              )}
            </div>

            {/* Course banner image */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.35 }}
              className="glass-shell"
            >
              <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full" style={{ borderRadius: "23px", background: "var(--amber-soft)" }}>
                {training.bannerUrl ? (
                  <img src={training.bannerUrl} alt={training.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="grid h-full min-h-[260px] w-full place-items-center">
                    <BookOpen className="h-16 w-16 opacity-20" style={{ color: "var(--ink)" }} />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Curriculum + includes ────────────────────────── */}
      <section className="relative px-6 py-16 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">

            {/* Roadmap */}
            <div>
              {training.youWillLearn?.length > 0 && (
                <div className="mb-10">
                  <h2 className="display text-2xl" style={{ color: "var(--ink)" }}>What you&apos;ll learn</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {training.youWillLearn.map((skill: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--moss)" }} />
                        <span className="text-[14.5px] leading-snug" style={{ color: "var(--ink-soft)" }}>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="display text-2xl" style={{ color: "var(--ink)" }}>Training Curriculum</h2>
              {roadmap.length > 0 ? (
                <ol className="mt-6 space-y-3">
                  {roadmap.map((item: unknown, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="glass-shell"
                    >
                      <div
                        className="relative overflow-hidden flex gap-4 p-4"
                        style={{ borderRadius: "23px", background: "rgba(255,255,255,0.60)", backdropFilter: "blur(14px)" }}
                      >
                        <div className={`flex gap-4 w-full transition-all duration-300 ${!isEnrolled && !isCheckingEnrollment ? "blur-[3px] select-none opacity-50" : ""}`}>
                          <span className="mono mt-0.5 shrink-0 text-[11px] font-bold w-5" style={{ color: "var(--amber-bright)" }}>{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <p className="font-bold" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>
                              {typeof item === "string" ? item : (item as { title?: string }).title ?? "Module"}
                            </p>
                            {typeof item !== "string" && (item as { description?: string }).description && (
                              <p className="mt-1 text-[13px]" style={{ color: "var(--ink-soft)" }}>{(item as { description?: string }).description}</p>
                            )}
                          </div>
                        </div>
                        {!isCheckingEnrollment && !isEnrolled && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(2px)" }}>
                            <div className="flex flex-col items-center gap-1.5 rounded-full px-4 py-2" style={{ background: "rgba(255,255,255,0.90)", border: "0.8px solid rgba(21,23,28,0.10)" }}>
                              <Lock className="h-4 w-4" style={{ color: "var(--ink-mute)" }} />
                              <span className="mono text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>Locked</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-[14px]" style={{ color: "var(--ink-soft)" }}>Detailed curriculum coming soon.</p>
              )}
            </div>

            {/* Includes sidebar */}
            <aside className="h-fit glass-shell">
              <div className="glass-card" style={{ borderRadius: "23px" }}>
                <h3 className="display text-lg" style={{ color: "var(--ink)" }}>Program includes</h3>
                <ul className="mt-5 space-y-3.5 text-[14px]">
                  {[
                    "Live instructor-led sessions",
                    "Production-grade projects",
                    "Peer code reviews",
                    "Certificate of completion",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: "var(--amber)" }}>
                        <CheckCircle className="h-3 w-3" style={{ color: "var(--ink)" }} />
                      </span>
                      <span style={{ color: "var(--ink-soft)" }}>{item}</span>
                    </li>
                  ))}
                </ul>

                {!isEnrolled && !isCheckingEnrollment && (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn-primary mt-6 w-full justify-center"
                  >
                    {enrolling && <Loader2 className="h-4 w-4 animate-spin" />}
                    {enrolling ? "Processing..." : training.isFree ? "Enroll for free" : "Buy now"}
                  </button>
                )}

                {isEnrolled && (
                  <Link href={`/learn/${training.slug}`} className="btn-amber mt-6 w-full justify-center">
                    Continue learning <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}

export default function TrainingDetailPage() {
  return (
    <Suspense fallback={null}>
      <TrainingContent />
    </Suspense>
  );
}

function formatPrice(amount: number, isFree: boolean): string {
  if (isFree || amount <= 0) return "Free";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
