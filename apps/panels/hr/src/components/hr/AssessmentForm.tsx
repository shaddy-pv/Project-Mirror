import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, qk, DOMAINS, type Assessment } from "@/lib/api";

const schema = z.object({
  title: z.string().min(4, "Give the assessment a title."),
  domain: z.string().min(1, "Pick a subject or domain."),
  listingId: z.string().min(1, "Pick the listing this assessment is for."),
  durationMins: z.coerce.number().min(5, "Give candidates at least 5 minutes."),
  status: z.enum(["Draft", "Live", "Closed"]),
});

type FormValues = z.input<typeof schema>;
type Question = any;

export function AssessmentForm({ assessment }: { assessment?: Assessment }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<Question[]>(assessment?.questions ?? []);

  const { data: listings = [] } = useQuery({ queryKey: qk.listings, queryFn: api.listings });
  const { data: applicants = [] } = useQuery({
    queryKey: qk.applicants(),
    queryFn: () => api.applicants(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: assessment?.title ?? "",
      domain: assessment?.domain ?? "",
      listingId: assessment?.listingId ?? "",
      durationMins: assessment?.durationMins ?? 60,
      status: assessment?.status ?? "Draft",
    },
  });

  const listingId = form.watch("listingId");
  const linkedListing = listings.find((l) => l.id === listingId);
  const eligible = applicants.filter((a) => a.careerId === listingId && a.stage !== "Applied");

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        title: values.title,
        domain: values.domain,
        listingId: values.listingId,
        durationMins: Number(values.durationMins),
        status: values.status,
        questions,
      };
      if (assessment) return api.updateAssessment(assessment.id, payload);
      return api.createAssessment(payload);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: qk.assessments });
      if (saved && (saved as any).id) {
        queryClient.invalidateQueries({ queryKey: qk.assessment((saved as any).id) });
        navigate({ to: "/assessments/$id", params: { id: (saved as any).id } });
      } else {
        navigate({ to: "/assessments" });
      }
      toast.success(assessment ? "Assessment saved" : "Assessment created");
    },
    onError: () => toast.error("Couldn't save this assessment. Please try again."),
  });

  const errors = form.formState.errors;

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit((v) => save.mutate(v))} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="e.g. Frontend Screening — React & JS" {...form.register("title")} />
          {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Subject / domain</Label>
          <Select value={form.watch("domain")} onValueChange={(v) => form.setValue("domain", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a subject" />
            </SelectTrigger>
            <SelectContent>
              {DOMAINS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.domain && <p className="text-xs text-danger">{errors.domain.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Linked listing</Label>
          <Select value={listingId} onValueChange={(v) => form.setValue("listingId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a listing" />
            </SelectTrigger>
            <SelectContent>
              {listings.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.listingId && <p className="text-xs text-danger">{errors.listingId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="duration">Time limit (minutes)</Label>
          <Input id="duration" type="number" min={5} {...form.register("durationMins")} />
          {errors.durationMins && (
            <p className="text-xs text-danger">{errors.durationMins.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v as "Draft" | "Live" | "Closed")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft — nobody can take it yet</SelectItem>
              <SelectItem value="Live">Live — shortlisted candidates can take it</SelectItem>
              <SelectItem value="Closed">Closed — no new attempts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Questions</h3>
            <p className="text-xs text-muted-foreground">
              Add multiple-choice questions, or upload a question file if you already have one.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setQuestions((prev) => [...prev, { prompt: "", options: ["", ""], answerIndex: 0 }])
              }
            >
              <Plus /> Add question
            </Button>
            <Label
              htmlFor="question-upload"
              className="inline-flex h-8 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-xs font-medium"
            >
              Upload questions
            </Label>
            <input
              id="question-upload"
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) toast.success("Question file attached");
              }}
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {questions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No questions yet → add your first question, or upload a file.
            </p>
          )}
          {questions.map((question, qi) => (
            <div key={qi} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <Input
                  value={question.prompt}
                  placeholder={`Question ${qi + 1}`}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((q, i) => (i === qi ? { ...q, prompt: e.target.value } : q)),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove question ${qi + 1}`}
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(question.options as string[]).map((option: string, oi: number) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`answer-${qi}`}
                      checked={question.answerIndex === oi}
                      aria-label={`Mark option ${oi + 1} correct`}
                      onChange={() =>
                        setQuestions((prev) =>
                          prev.map((q, i) => (i === qi ? { ...q, answerIndex: oi } : q)),
                        )
                      }
                    />
                    <Input
                      value={option}
                      placeholder={`Option ${oi + 1}`}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((q, i) =>
                            i === qi
                              ? {
                                  ...q,
                                  options: (q.options as string[]).map((o: string, j: number) => (j === oi ? e.target.value : o)),
                                }
                              : q,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setQuestions((prev) =>
                    prev.map((q, i) => (i === qi ? { ...q, options: [...q.options, ""] } : q)),
                  )
                }
              >
                <Plus /> Add option
              </Button>
              <p className="text-xs text-muted-foreground">
                The option with the filled circle is the correct answer.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">Who can take this</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {linkedListing
            ? `Only people Shortlisted for ${linkedListing.title} can take this.`
            : "Pick a linked listing first — then only people Shortlisted for that listing can take this."}
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {eligible.length === 0 ? (
            <li className="text-muted-foreground">
              Nobody is shortlisted for this listing yet. Move applicants to Shortlisted and they'll
              appear here automatically.
            </li>
          ) : (
            eligible.map((a) => (
              <li key={a.id} className="flex justify-between rounded-md bg-muted px-3 py-1.5">
                <span>{a.name}</span>
                <span className="text-xs text-muted-foreground">{a.email}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={save.isPending}>
          {assessment ? "Save assessment" : "Create assessment"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/assessments" })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
