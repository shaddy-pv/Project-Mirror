import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Clock3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getOAResultAnalysis, updateInternshipApplicationStatus, updateCareerApplicationStatus } from "@/lib/api";

export const Route = createFileRoute("/oa-result/$assessmentId/$userId")({
  component: OAResultPage,
});

function OAResultPage() {
  const { assessmentId, userId } = Route.useParams();
  const searchParams = Route.useSearch() as any;
  const appId = searchParams.appId;
  const appType = searchParams.appType as "internship" | "career";
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["oa-result", assessmentId, userId],
    queryFn: () => getOAResultAnalysis(assessmentId, userId),
  });

  const updateStatusMut = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      if (!appId || !appType) throw new Error("Missing appId or appType to update status.");
      if (appType === "internship") {
        await updateInternshipApplicationStatus(appId, status, assessmentId);
      } else {
        await updateCareerApplicationStatus(appId, status, assessmentId);
      }
    },
    onSuccess: () => {
      toast.success("Applicant status updated!");
      setTimeout(() => window.close(), 1500); // close tab automatically after success
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (error || !data || !data.assessment || !data.session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h2 className="text-xl font-bold">Failed to load OA Result</h2>
        <p className="text-muted-foreground">{error?.message || "Data not found."}</p>
        <Button variant="outline" onClick={() => window.close()}>Close Tab</Button>
      </div>
    );
  }

  const { assessment, session } = data;
  const totalScore = session.totalScore || 0;
  const maxScore = assessment.modules?.reduce((sum: number, m: any) => sum + (m.questions?.length || 0), 0) || 25;
  const isPassed = totalScore >= (maxScore * 0.7);
  
  const timeSpentSeconds = session.createdAt && session.completedAt
    ? Math.max(0, Math.round((new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime()) / 1000))
    : 0;
  const timeStr = timeSpentSeconds > 120 
    ? `${Math.round(timeSpentSeconds / 60)}m` 
    : `${timeSpentSeconds}s`;

  const handleMark = (status: "oa-cleared" | "oa-failed") => {
    if (!appId || !appType) {
      toast.error("Cannot update: Application ID or Type is missing in URL parameters. Please close and re-open from the panel.");
      return;
    }
    updateStatusMut.mutate({ status });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.close()}>
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">OA Result Analysis</h1>
              <p className="text-sm text-muted-foreground">{assessment.title} • Applicant ID: {userId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              disabled={updateStatusMut.isPending}
              onClick={() => handleMark("oa-failed")} 
              className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" /> Mark as Failed
            </Button>
            <Button 
              disabled={updateStatusMut.isPending}
              onClick={() => handleMark("oa-cleared")} 
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark as Cleared
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-10">
        {/* Score Overview */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-5">
            <div className={`grid h-16 w-16 place-items-center rounded-full ${isPassed ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
              {isPassed ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Total Score</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalScore} <span className="text-lg text-muted-foreground font-medium">/ {maxScore}</span></p>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-purple-100 text-purple-600">
              <Clock3 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Time Spent</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {timeStr}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Module Breakdown</p>
            <div className="space-y-2">
              {assessment.modules.map((m: any, i: number) => {
                const score = session.moduleScores?.[i] ?? 0;
                const total = m.questions?.length ?? 0;
                const pct = Math.round((score / total) * 100) || 0;
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate pr-3 font-medium text-foreground">{m.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{score}/{total}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Q&A Analysis */}
        <div className="space-y-12">
          {assessment.modules.map((mod: any, mIdx: number) => (
            <div key={mIdx}>
              <h2 className="mb-6 text-xl font-bold text-foreground border-b pb-2">{mod.title}</h2>
              <div className="space-y-4">
                {mod.questions.map((q: any, qIdx: number) => {
                  const moduleAnswerList = session.moduleAnswers?.[mIdx] || [];
                  const answerObj = moduleAnswerList.find((a: any) => a.questionIndex === qIdx);
                  const userAnswer = answerObj ? answerObj.selected : null;
                  const isCorrect = answerObj ? answerObj.isCorrect : false;
                  
                  return (
                    <div key={qIdx} className={`rounded-xl border p-5 ${isCorrect ? "bg-emerald-50/30 border-emerald-100" : "bg-red-50/30 border-red-100"}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            <span className="text-muted-foreground font-normal mr-2">Q{qIdx + 1}.</span> 
                            {q.text}
                          </p>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isUserSelected = userAnswer === optIdx;
                              const isActualCorrect = q.correctAnswer === optIdx;
                              
                              let cls = "border bg-white text-muted-foreground";
                              if (isActualCorrect) cls = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
                              else if (isUserSelected && !isCorrect) cls = "border-red-500 bg-red-50 text-red-900 font-medium";

                              return (
                                <div key={optIdx} className={`rounded-lg px-4 py-2.5 text-sm ${cls} flex items-center justify-between`}>
                                  <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                  {isUserSelected && (
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isCorrect ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"}`}>
                                      Their Answer
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
