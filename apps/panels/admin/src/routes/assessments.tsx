import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList, Plus, Trash2, Pencil, ChevronDown, ChevronUp,
  Clock, HelpCircle, CheckCircle2, AlertCircle, Loader2, X, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/panel/PageHeader";
import { EmptyState } from "@/components/panel/EmptyState";
import {
  listAssessments, saveAssessment, deleteAssessment, getAssessmentForEdit, getAssessmentResults,
  listInternships, listCareers,
  type Assessment, type AssessmentModule, type AssessmentQuestion,
} from "@/mocks/api";

export const Route = createFileRoute("/assessments")({
  head: () => ({ meta: [{ title: "Assessments — Enginow Panel" }] }),
  component: AssessmentsPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyQuestion(): AssessmentQuestion {
  return { text: "", options: ["", "", "", ""], correctAnswer: 0 };
}

function emptyModule(): AssessmentModule {
  return { title: "", timeLimitSeconds: 600, questions: [emptyQuestion()] };
}

function totalQuestions(modules: AssessmentModule[]): number {
  return modules.reduce((sum, m) => sum + m.questions.length, 0);
}

const OPTION_LABELS = ["A", "B", "C", "D"];

// ─── Question Editor ──────────────────────────────────────────────────────────

function QuestionEditor({
  question, qIdx, onChange, onDelete, canDelete,
}: {
  question: AssessmentQuestion;
  qIdx: number;
  onChange: (q: AssessmentQuestion) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Q{qIdx + 1}</span>
        {canDelete && (
          <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Textarea
        placeholder="Question text..."
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        className="min-h-[60px] text-sm"
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {question.options.map((opt, oIdx) => (
          <div key={oIdx} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...question, correctAnswer: oIdx })}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold border-2 transition-colors ${
                question.correctAnswer === oIdx
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-muted-foreground/40 text-muted-foreground hover:border-emerald-400"
              }`}
              title="Mark as correct answer"
            >
              {OPTION_LABELS[oIdx]}
            </button>
            <Input
              value={opt}
              onChange={(e) => {
                const newOpts = [...question.options] as [string, string, string, string];
                newOpts[oIdx] = e.target.value;
                onChange({ ...question, options: newOpts });
              }}
              placeholder={`Option ${OPTION_LABELS[oIdx]}`}
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        ✓ Correct: Option <strong>{OPTION_LABELS[question.correctAnswer]}</strong> — click a letter to change
      </p>
    </div>
  );
}

// ─── Module Editor ────────────────────────────────────────────────────────────

function ModuleEditor({
  mod, mIdx, onChange, onDelete, canDelete,
}: {
  mod: AssessmentModule;
  mIdx: number;
  onChange: (m: AssessmentModule) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const addQuestion = () => onChange({ ...mod, questions: [...mod.questions, emptyQuestion()] });
  const removeQuestion = (qi: number) => onChange({ ...mod, questions: mod.questions.filter((_, i) => i !== qi) });
  const updateQuestion = (qi: number, q: AssessmentQuestion) => {
    const qs = [...mod.questions];
    qs[qi] = q;
    onChange({ ...mod, questions: qs });
  };

  const minutesVal = Math.floor(mod.timeLimitSeconds / 60);

  return (
    <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/40">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          {mIdx + 1}
        </span>
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <Input
            value={mod.title}
            onChange={(e) => onChange({ ...mod, title: e.target.value })}
            placeholder={`Module ${mIdx + 1}: e.g. Fundamentals of Programming`}
            className="h-8 flex-1 font-semibold"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="number"
              min={1}
              max={120}
              value={minutesVal}
              onChange={(e) => onChange({ ...mod, timeLimitSeconds: Number(e.target.value) * 60 })}
              className="h-8 w-20 text-sm"
            />
            <span className="text-[12px] text-muted-foreground">min</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-muted-foreground font-mono">{mod.questions.length}Q</span>
          {canDelete && (
            <button onClick={onDelete} className="ml-1 text-muted-foreground hover:text-destructive transition-colors" title="Delete module">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={() => setCollapsed(v => !v)} className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-3">
          {mod.questions.map((q, qi) => (
            <QuestionEditor
              key={qi}
              question={q}
              qIdx={qi}
              onChange={(updated) => updateQuestion(qi, updated)}
              onDelete={() => removeQuestion(qi)}
              canDelete={mod.questions.length > 1}
            />
          ))}
          <Button variant="outline" size="sm" onClick={addQuestion} className="w-full gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Question to this module
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Assessment Builder Form ──────────────────────────────────────────────────

function AssessmentBuilder({
  initial, onSave, onCancel,
}: {
  initial?: Assessment;
  onSave: (data: Assessment) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [listingId, setListingId] = useState(initial?.listingId ?? "");
  const [listingType, setListingType] = useState<"internship" | "career">(initial?.listingType ?? "internship");
  const [modules, setModules] = useState<AssessmentModule[]>(
    initial?.modules?.length ? initial.modules : [emptyModule()]
  );
  const [saving, setSaving] = useState(false);

  const { data: internships = [] } = useQuery({ queryKey: ["internships"], queryFn: listInternships });
  const { data: careers = [] } = useQuery({ queryKey: ["careers"], queryFn: listCareers });

  const listings = listingType === "internship"
    ? (internships as any[]).map(i => ({ id: i.id, label: i.title }))
    : (careers as any[]).map(c => ({ id: c.id, label: c.title }));

  const total = totalQuestions(modules);
  const isValid = total <= 25 && total > 0 && title.trim() && listingId;

  const addModule = () => setModules(m => [...m, emptyModule()]);
  const removeModule = (i: number) => setModules(m => m.filter((_, idx) => idx !== i));
  const updateModule = (i: number, mod: AssessmentModule) => setModules(m => {
    const updated = [...m]; updated[i] = mod; return updated;
  });

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({ ...(initial?.id ? { id: initial.id } : {}), title, description, listingId, listingType, modules });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Meta */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Assessment Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Web Dev OA – Summer 2025" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description (optional)</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Instructions shown to the candidate before starting..." className="min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Listing Type</Label>
            <Select value={listingType} onValueChange={(v) => { setListingType(v as any); setListingId(""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="career">Career</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Link to Listing</Label>
            <Select value={listingId} onValueChange={setListingId}>
              <SelectTrigger><SelectValue placeholder="Select a listing..." /></SelectTrigger>
              <SelectContent>
                {listings.map((l: any) => (
                  <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Question counter */}
      <div className={`flex items-center gap-3 rounded-xl border-2 px-5 py-3 ${
        total === 0
          ? "border-muted bg-muted/30"
          : total > 25
            ? "border-red-300 bg-red-50"
            : "border-emerald-300 bg-emerald-50"
      }`}>
        {total > 25
          ? <AlertCircle className="h-5 w-5 text-red-600" />
          : <CheckCircle2 className={`h-5 w-5 ${total > 0 ? "text-emerald-600" : "text-muted-foreground"}`} />}
        <div>
          <p className={`text-sm font-semibold ${
            total > 25 ? "text-red-700" : total > 0 ? "text-emerald-700" : "text-muted-foreground"
          }`}>
            {total} / 25 max questions
          </p>
          <p className="text-[12px] text-muted-foreground">
            {total > 25
              ? `Remove ${total - 25} question${total - 25 > 1 ? "s" : ""} — maximum is 25`
              : total === 0
                ? "Add at least one question to continue"
                : `${25 - total} more question${25 - total !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {modules.map((mod, i) => (
          <ModuleEditor
            key={i}
            mod={mod}
            mIdx={i}
            onChange={(m) => updateModule(i, m)}
            onDelete={() => removeModule(i)}
            canDelete={modules.length > 1}
          />
        ))}
        <Button variant="outline" onClick={addModule} className="w-full gap-2">
          <Plus className="h-4 w-4" /> Add Module
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={!isValid || saving} className="gap-2 min-w-[120px]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Saving..." : initial?.id ? "Save Changes" : "Create Assessment"}
        </Button>
      </div>
    </div>
  );
}

// ─── Results Viewer ───────────────────────────────────────────────────────────

function ResultsPanel({ assessmentId, onClose }: { assessmentId: string; onClose: () => void }) {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["assessment-results", assessmentId],
    queryFn: () => getAssessmentResults(assessmentId),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Submissions</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (results as any[]).length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">No submissions yet.</p>
      ) : (
        <div className="space-y-2">
          {(results as any[]).map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-[13px] font-medium">{r.userId}</p>
                <p className="text-[11px] text-muted-foreground">
                  {r.completedAt ? new Date(r.completedAt).toLocaleString("en-IN") : "In progress"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[18px] font-bold">{r.totalScore ?? "—"}<span className="text-sm font-normal text-muted-foreground">/25</span></p>
                <p className="text-[11px] text-muted-foreground">{r.completedAt ? "Completed" : "Pending"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function AssessmentsPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<"list" | "create" | "edit" | "results">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resultsId, setResultsId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Assessment | undefined>();

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ["assessments"],
    queryFn: listAssessments,
  });

  const saveMut = useMutation({
    mutationFn: saveAssessment,
    onSuccess: () => {
      toast.success(editingId ? "Assessment updated!" : "Assessment created!");
      qc.invalidateQueries({ queryKey: ["assessments"] });
      setView("list");
      setEditingId(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => { toast.success("Assessment deleted"); qc.invalidateQueries({ queryKey: ["assessments"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  async function startEdit(id: string) {
    try {
      const data = await getAssessmentForEdit(id);
      setEditData(data);
      setEditingId(id);
      setView("edit");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6">
        <PageHeader
          title={view === "create" ? "Create Assessment" : "Edit Assessment"}
          subtitle={view === "create"
            ? "Build a 25-question MCQ assessment linked to an internship or career listing."
            : "Make changes to this assessment."}
          actions={<Button variant="outline" onClick={() => { setView("list"); setEditingId(null); }}>← Back</Button>}
        />
        <AssessmentBuilder
          {...(view === "edit" && editData ? { initial: editData } : {})}
          onSave={async (data) => { await saveMut.mutateAsync(data); }}
          onCancel={() => { setView("list"); setEditingId(null); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        subtitle="Create and manage OA rounds linked to internship and career listings."
        actions={
          <Button onClick={() => { setEditData(undefined); setView("create"); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Assessment
          </Button>
        }
      />

      {resultsId && (
        <div className="rounded-xl border bg-card p-5">
          <ResultsPanel assessmentId={resultsId} onClose={() => setResultsId(null)} />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>
      ) : (assessments as Assessment[]).length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          message="Create your first assessment to start sending OA rounds to candidates."
          actionLabel="Create Assessment"
          onAction={() => setView("create")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(assessments as Assessment[]).map((a) => (
            <div key={a.id} className="rounded-xl border bg-card p-5 space-y-3 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] truncate">{a.title}</p>
                  <p className="text-[12px] text-muted-foreground capitalize">{a.listingType} OA</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
                  <HelpCircle className="h-3 w-3 inline mr-1 opacity-60" />
                  {a.modules?.reduce((s, m) => s + (m.questions?.length || 0), 0) || 0} questions
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
                  <Clock className="h-3 w-3 inline mr-1 opacity-60" />
                  {a.modules?.length || 0} module{a.modules?.length !== 1 ? "s" : ""}
                </span>
              </div>
              {a.description && (
                <p className="text-[12.5px] text-muted-foreground line-clamp-2">{a.description}</p>
              )}
              <div className="mt-auto pt-2 flex items-center gap-2 border-t">
                <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs h-8" onClick={() => setResultsId(a.id!)}>
                  <Eye className="h-3.5 w-3.5" /> Results
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs h-8" onClick={() => startEdit(a.id!)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:border-destructive"
                  onClick={() => { if (confirm("Delete this assessment?")) deleteMut.mutate(a.id!); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
