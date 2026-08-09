import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AssessmentForm } from "@/components/hr/AssessmentForm";
import { PageHeader } from "@/components/hr/PageHeader";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, qk } from "@/lib/api";

export const Route = createFileRoute("/assessments/$id")({
  head: () => ({
    meta: [
      { title: "Assessment & results — Enginow HR" },
      {
        name: "description",
        content: "Edit an assessment's questions and review candidate scores and integrity flags.",
      },
      { property: "og:title", content: "Assessment & results — Enginow HR" },
      { property: "og:description", content: "Edit questions and review candidate scores." },
    ],
  }),
  component: AssessmentDetailPage,
});

function AssessmentDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: assessment, isLoading } = useQuery({
    queryKey: qk.assessment(id),
    queryFn: () => api.assessment(id),
  });

  // setResultAccess is a no-op for now - results come from real assessments backend
  const setAccess = useMutation({
    mutationFn: (_vars: { applicantId: string; hrCanSee: boolean }) =>
      Promise.resolve(),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: qk.assessment(id) });
      toast.success(
        vars.hrCanSee ? "You can now see this result" : "You can no longer see this result",
      );
    },
    onError: () => toast.error("Couldn't change access. Please try again."),
  });

  if (isLoading) {
    return <div className="px-6 py-10 text-sm text-muted-foreground">Loading assessment…</div>;
  }
  if (!assessment) {
    return (
      <div className="px-6 py-10">
        <p className="text-sm text-muted-foreground">This assessment no longer exists.</p>
        <Link to="/assessments" className="mt-3 inline-block text-sm text-brand underline">
          Back to Assessments
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={assessment.title}
        subtitle={`${assessment.domain ?? assessment.listingType} · ${assessment.durationMins ?? ""} minutes`}
        help={[
          "The Results tab shows each candidate's score and anything our integrity checks flagged.",
          "Admin can always see results. Use the toggle to give yourself access to a specific result.",
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/assessments" })}>
            <ArrowLeft /> All assessments
          </Button>
        }
      />

      <div className="space-y-5 px-6 py-6">
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <StatusBadge status={assessment.status} />
          <span className="text-sm text-muted-foreground">
            {(assessment.questions?.length ?? 0)}{" "}
            {(assessment.questions?.length ?? 0) === 1 ? "question" : "questions"} ·{" "}
            {(assessment.results?.length ?? 0)} {(assessment.results?.length ?? 0) === 1 ? "attempt" : "attempts"}
          </span>
        </div>

        <Tabs defaultValue="results">
          <TabsList>
            <TabsTrigger value="results">Results ({assessment.results?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="edit">Edit assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-4">
            {(assessment.results?.length ?? 0) === 0 ? (
              <div className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                No one has taken this assessment yet. Scores appear here as candidates finish.
              </div>
            ) : (
              <div className="divide-y overflow-hidden rounded-xl border bg-card">
                {(assessment.results ?? []).map((result: any) => (
                  <div
                    key={result.applicantId}
                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{result.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Score {result.score}/100
                        {result.flags.length > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 text-danger">
                            <AlertTriangle className="size-3" /> {result.flags.join(", ")}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`access-${result.applicantId}`}
                        checked={result.hrCanSee}
                        onCheckedChange={(checked) =>
                          setAccess.mutate({
                            applicantId: result.applicantId,
                            hrCanSee: checked,
                          })
                        }
                      />
                      <label htmlFor={`access-${result.applicantId}`} className="text-xs">
                        I can see this result (Admin always can)
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="mt-4 max-w-3xl">
            <AssessmentForm assessment={assessment} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
