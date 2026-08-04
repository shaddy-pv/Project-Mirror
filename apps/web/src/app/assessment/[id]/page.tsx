"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Clock, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Loader2, BookOpen, ArrowRight } from "lucide-react";
import { firebaseAuth } from "@/integrations/firebase/client";
import { useAuthContext } from "@/providers/auth-provider";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (firebaseAuth.currentUser) {
    const token = await firebaseAuth.currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function getAssessmentInfo(id: string) {
  return fetchWithAuth(`/assessments/${id}/info`);
}
async function startModule(id: string, moduleIndex: number) {
  return fetchWithAuth(`/assessments/${id}/start-module`, {
    method: "POST",
    body: JSON.stringify({ moduleIndex }),
  });
}
async function submitModule(id: string, moduleIndex: number, answers: Record<number, number>) {
  return fetchWithAuth(`/assessments/${id}/submit-module`, {
    method: "POST",
    body: JSON.stringify({ moduleIndex, answers }),
  });
}
async function completeAssessment(id: string) {
  return fetchWithAuth(`/assessments/${id}/complete`, { method: "POST" });
}

// ─── Timer component ──────────────────────────────────────────────────────────

function Timer({ secondsLeft, onExpire }: { secondsLeft: number; onExpire: () => void }) {
  const [secs, setSecs] = useState(secondsLeft);
  const expired = useRef(false);

  useEffect(() => {
    setSecs(secondsLeft);
    expired.current = false;
  }, [secondsLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecs(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expired.current) { expired.current = true; onExpire(); }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const mins = Math.floor(secs / 60);
  const ss = secs % 60;
  const isUrgent = secs < 60;

  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-mono font-bold transition-colors ${isUrgent ? "bg-red-100 text-red-600 animate-pulse" : "bg-purple-100 text-purple-700"}`}>
      <Clock className="h-3.5 w-3.5" />
      {String(mins).padStart(2, "0")}:{String(ss).padStart(2, "0")}
    </div>
  );
}

// ─── Question component ───────────────────────────────────────────────────────

const OPTION_LABELS = ["A", "B", "C", "D"];

function QuestionCard({
  question, qIdx, selected, onSelect,
}: {
  question: { text: string; options: string[] };
  qIdx: number;
  selected: number | undefined;
  onSelect: (opt: number) => void;
}) {
  return (
    <motion.div
      key={qIdx}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      <p className="text-[16px] font-semibold leading-relaxed" style={{ color: "var(--ink)" }}>
        <span className="text-[13px] font-mono font-normal mr-2" style={{ color: "var(--ink-mute)" }}>Q{qIdx + 1}.</span>
        {question.text}
      </p>
      <div className="space-y-2.5">
        {question.options.map((opt, oIdx) => (
          <button
            key={oIdx}
            onClick={() => onSelect(oIdx)}
            className={`w-full flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-left text-[14px] transition-all ${
              selected === oIdx
                ? "border-purple-500 bg-purple-50 font-medium"
                : "border-[rgba(21,23,28,0.1)] bg-white hover:border-purple-300 hover:bg-purple-50/40"
            }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold border-2 transition-colors ${
              selected === oIdx ? "border-purple-600 bg-purple-600 text-white" : "border-gray-300 text-gray-500"
            }`}>
              {OPTION_LABELS[oIdx]}
            </span>
            <span style={{ color: "var(--ink)" }}>{opt}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const { id } = useParams() as { id: string };
  const { isAuthenticated } = useAuthContext();

  const [phase, setPhase] = useState<"loading" | "intro" | "module" | "transition" | "done">("loading");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // answers: moduleIndex -> questionIndex -> selectedOption
  const [answers, setAnswers] = useState<Record<number, Record<number, number>>>({});
  const [submittingModule, setSubmittingModule] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [moduleTimeLimits, setModuleTimeLimits] = useState<Record<number, number>>({});
  const [timerKey, setTimerKey] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["assessment-info", id],
    queryFn: () => getAssessmentInfo(id),
    enabled: isAuthenticated,
  });

  const assessment = data?.assessment;
  const session = data?.session;

  useEffect(() => {
    if (!data) return;
    if (session?.completedAt) {
      setPhase("done");
      return;
    }
    if (session?.completedModules?.length > 0) {
      setCompletedModules(session.completedModules);
    }
    setPhase("intro");
  }, [data, session]);

  const startModuleMut = useMutation({ mutationFn: ({ mIdx }: { mIdx: number }) => startModule(id, mIdx) });

  async function handleStartModule(mIdx: number) {
    setCurrentModule(mIdx);
    setCurrentQuestion(0);
    setPhase("module");
    setTimerKey(k => k + 1);
    await startModuleMut.mutateAsync({ mIdx });
  }

  const handleSelectAnswer = useCallback((qIdx: number, opt: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentModule]: { ...(prev[currentModule] ?? {}), [qIdx]: opt },
    }));
  }, [currentModule]);

  async function handleSubmitModule(mIdx: number, force?: boolean) {
    if (submittingModule) return;
    const mod = assessment?.modules?.[mIdx];
    if (!mod) return;
    const unanswered = mod.questions.filter((_: any, qi: number) => answers[mIdx]?.[qi] === undefined).length;
    if (!force && unanswered > 0) {
      const ok = window.confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Submit anyway?`);
      if (!ok) return;
    }
    setSubmittingModule(true);
    try {
      await submitModule(id, mIdx, answers[mIdx] ?? {});
      setCompletedModules(prev => [...prev, mIdx]);
      // If more modules remain, show transition screen
      if (mIdx + 1 < assessment.modules.length) {
        setPhase("transition");
      } else {
        // All modules done — complete
        await completeAssessment(id);
        setPhase("done");
      }
    } catch (e: any) {
      alert(e.message || "Failed to submit. Please try again.");
    } finally {
      setSubmittingModule(false);
    }
  }

  const handleTimerExpire = useCallback(() => {
    handleSubmitModule(currentModule, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModule, answers]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[14px]" style={{ color: "var(--ink-mute)" }}>Please log in to take this assessment.</p>
      </div>
    );
  }

  if (isLoading || phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--ink-mute)" }} />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>Assessment not found or access denied.</p>
        <a href="/learner-dashboard" className="text-[13px] underline" style={{ color: "var(--ink-mute)" }}>← Back to dashboard</a>
      </div>
    );
  }

  const mod = assessment.modules?.[currentModule];
  const totalModules = assessment.modules?.length ?? 0;

  // ─── Done screen ──────────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-10 text-center"
        >
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>Assessment Submitted!</h1>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Your responses have been recorded. Our team will review your submission and get back to you shortly.
          </p>
          <a href="/learner-dashboard"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)" }}
          >
            Back to Dashboard <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </main>
    );
  }

  // ─── Module transition screen ─────────────────────────────────────────────
  if (phase === "transition") {
    const nextMIdx = currentModule + 1;
    const nextMod = assessment.modules?.[nextMIdx];
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-10 text-center"
        >
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-purple-100">
            <CheckCircle2 className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-[12px] uppercase tracking-widest font-semibold text-purple-600 mb-2">Module {currentModule + 1} Complete</p>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>Great work!</h2>
          <p className="text-[14px] mb-8" style={{ color: "var(--ink-soft)" }}>
            Up next: <strong>{nextMod?.title}</strong> ({Math.round((nextMod?.timeLimitSeconds ?? 600) / 60)} min)
          </p>
          <button
            onClick={() => handleStartModule(nextMIdx)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)" }}
          >
            Start Module {nextMIdx + 1} <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </main>
    );
  }

  // ─── Intro screen ─────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <main className="min-h-screen px-6 py-16" style={{ background: "linear-gradient(135deg,#faf5ff,#f5f3ff)" }}>
        <div className="mx-auto max-w-2xl">
          <a href="/learner-dashboard" className="inline-flex items-center gap-1.5 text-[13px] mb-8 transition-colors" style={{ color: "var(--ink-mute)" }}>
            <ChevronLeft className="h-3.5 w-3.5" /> Back to dashboard
          </a>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <div className="rounded-3xl bg-white shadow-xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)" }}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-purple-600">OA Round</p>
                  <h1 className="text-xl font-bold" style={{ color: "var(--ink)" }}>{assessment.title}</h1>
                </div>
              </div>
              {assessment.description && (
                <p className="text-[14px] leading-relaxed mb-6" style={{ color: "var(--ink-soft)" }}>{assessment.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="rounded-2xl bg-purple-50 px-4 py-2 text-[13px] font-medium text-purple-700">
                  25 questions
                </div>
                <div className="rounded-2xl bg-purple-50 px-4 py-2 text-[13px] font-medium text-purple-700">
                  {totalModules} module{totalModules !== 1 ? "s" : ""}
                </div>
                <div className="rounded-2xl bg-amber-50 px-4 py-2 text-[13px] font-medium text-amber-700">
                  MCQ format
                </div>
              </div>
              <div className="space-y-3 mb-8">
                <p className="text-[12px] uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--ink-mute)" }}>Modules</p>
                {assessment.modules?.map((m: any, i: number) => (
                  <div key={i} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${completedModules.includes(i) ? "border-emerald-200 bg-emerald-50" : "border-[rgba(21,23,28,0.08)] bg-white"}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${completedModules.includes(i) ? "bg-emerald-600 text-white" : "bg-purple-100 text-purple-700"}`}>
                      {completedModules.includes(i) ? "✓" : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>{m.title}</p>
                      <p className="text-[12px]" style={{ color: "var(--ink-mute)" }}>{m.questions?.length} questions · {Math.round(m.timeLimitSeconds / 60)} min</p>
                    </div>
                    {completedModules.includes(i) && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-[13px] text-amber-700 mb-6">
                ⚠️ Each module has a time limit. Once you start a module, you cannot go back to it after submitting.
              </div>
              <button
                onClick={() => {
                  const firstIncomplete = assessment.modules?.findIndex((_: any, i: number) => !completedModules.includes(i)) ?? 0;
                  handleStartModule(firstIncomplete);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold text-white transition-all shadow-lg shadow-purple-200"
                style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)" }}
              >
                {completedModules.length > 0 ? "Continue Assessment" : "Start Assessment"} <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ─── Active module screen ─────────────────────────────────────────────────
  if (!mod) return null;
  const moduleAnswers = answers[currentModule] ?? {};
  const answeredCount = Object.keys(moduleAnswers).length;
  const totalInModule = mod.questions.length;

  return (
    <main className="min-h-screen" style={{ background: "#faf5ff" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur px-4 py-3 flex items-center gap-4" style={{ borderColor: "rgba(21,23,28,0.08)" }}>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-purple-600">Module {currentModule + 1} of {totalModules}</p>
          <p className="truncate text-[14px] font-bold" style={{ color: "var(--ink)" }}>{mod.title}</p>
        </div>
        <Timer key={timerKey} secondsLeft={mod.timeLimitSeconds} onExpire={handleTimerExpire} />
        <div className="text-[12px] font-medium" style={{ color: "var(--ink-mute)" }}>
          {answeredCount}/{totalInModule}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Question navigator */}
        <div className="flex flex-wrap gap-2 mb-6">
          {mod.questions.map((_: any, qi: number) => (
            <button
              key={qi}
              onClick={() => setCurrentQuestion(qi)}
              className={`h-8 w-8 rounded-full text-[12px] font-bold border-2 transition-all ${
                qi === currentQuestion
                  ? "border-purple-600 bg-purple-600 text-white"
                  : moduleAnswers[qi] !== undefined
                    ? "border-purple-300 bg-purple-50 text-purple-600"
                    : "border-gray-200 bg-white text-gray-500 hover:border-purple-300"
              }`}
            >
              {qi + 1}
            </button>
          ))}
        </div>

        {/* Question */}
        <div className="rounded-3xl bg-white shadow-sm p-6 mb-6" style={{ border: "1px solid rgba(21,23,28,0.08)" }}>
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestion}
              question={mod.questions[currentQuestion]}
              qIdx={currentQuestion}
              selected={moduleAnswers[currentQuestion]}
              onSelect={(opt) => handleSelectAnswer(currentQuestion, opt)}
            />
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-[13px] font-medium transition-all disabled:opacity-40"
            style={{ borderColor: "rgba(21,23,28,0.12)", color: "var(--ink)" }}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          {currentQuestion < totalInModule - 1 ? (
            <button
              onClick={() => setCurrentQuestion(q => q + 1)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)" }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => handleSubmitModule(currentModule)}
              disabled={submittingModule}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] font-bold text-white transition-all disabled:opacity-60"
              style={{ background: answeredCount === totalInModule ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#7c3aed,#9333ea)" }}
            >
              {submittingModule ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {currentModule === totalModules - 1 ? "Submit Assessment" : "Submit Module"}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-6 rounded-full bg-gray-100 h-2">
          <div
            className="h-2 rounded-full bg-purple-500 transition-all duration-500"
            style={{ width: `${(answeredCount / totalInModule) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-center text-[12px]" style={{ color: "var(--ink-mute)" }}>
          {answeredCount} of {totalInModule} questions answered
        </p>
      </div>
    </main>
  );
}
