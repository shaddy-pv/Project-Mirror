import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { EmptyState } from "@/components/panel/EmptyState";
import { PageHeader } from "@/components/panel/PageHeader";
import { RoleGuard } from "@/components/panel/RoleGuard";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { ApprovalBar } from "@/components/panel/ApprovalBar";
import { ConfirmDialog } from "@/components/panel/ConfirmDialog";
import { ImageUploader } from "@/components/panel/ImageUploader";
import { RepeatableLinkNotes } from "@/components/panel/RepeatableLinkNotes";
import { canApprove, useSession } from "@/lib/session";
import type { Course } from "@/lib/types";
import { listCourses, saveCourse, setCourseStatus } from "@/mocks/api";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses & Training — Enginow Panel" },
      {
        name: "description",
        content: "Add, edit and publish the courses and training programmes on the Enginow website.",
      },
      { property: "og:title", content: "Courses & Training — Enginow Panel" },
      {
        property: "og:description",
        content: "Add, edit and publish the courses and training programmes on the Enginow website.",
      },
    ],
  }),
  component: () => (
    <RoleGuard module="courses">
      <CoursesPage />
    </RoleGuard>
  ),
});

const CATEGORIES = ["AI & Data", "Development", "Core Engineering", "Aptitude", "Design"];

type Draft = {
  id?: string;
  title: string;
  kind: "course" | "training";
  category: string;
  pricing: "Free" | "Premium";
  badges: string[];
  description: string;
  bannerUrl?: string | undefined;
  videos: { url: string; notes: string }[];
  roadmap: string[];
};

const blankDraft = (kind: "course" | "training"): Draft => ({
  title: "",
  kind,
  category: "Development",
  pricing: "Free",
  badges: [],
  description: "",
  videos: [{ url: "", notes: "" }],
  roadmap: [""],
});

function CoursesPage() {
  const qc = useQueryClient();
  const { role, name } = useSession();
  const { data: courses = [], isPending } = useQuery({ queryKey: ["courses"], queryFn: listCourses });
  const [tab, setTab] = useState<"course" | "training">("course");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [viewing, setViewing] = useState<Course | null>(null);
  const [archiving, setArchiving] = useState<Course | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mine = role === "educator";
  const visible = courses.filter(
    (c) => c.kind === tab && (!mine || c.createdBy === name || c.createdByRole === "educator"),
  );

  const save = useMutation({
    mutationFn: (input: Partial<Course> & { id?: string }) => saveCourse(input),
    onSuccess: (course) => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setDraft(null);
      toast.success(
        course.status === "pending"
          ? `"${course.title}" sent for approval`
          : `"${course.title}" published`,
      );
    },
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: Course["status"]; reason?: string }) =>
      setCourseStatus(id, status, reason),
    onSuccess: (course, vars) => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setViewing(course);
      toast.success(
        vars.status === "live"
          ? `"${course.title}" approved and published`
          : vars.status === "rejected"
            ? `"${course.title}" sent back to the author`
            : `"${course.title}" archived`,
      );
    },
  });

  function submitDraft(status: "draft" | "pending" | "live") {
    if (!draft) return;
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next['title'] = "Give this a title so people know what it is.";
    if (draft.description.trim().length < 20)
      next['description'] = "Write at least a sentence or two describing what learners get.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    save.mutate({
      ...draft,
      status,
      createdBy: draft.id ? undefined as unknown as string : name,
      createdByRole: draft.id ? undefined as unknown as never : role,
      videos: draft.videos.filter((v) => v.url.trim()),
      roadmap: draft.roadmap.filter((r) => r.trim()),
    });
  }

  const columns: Column<Course>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title,
      cell: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">Added by {r.createdBy}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (r) => r.category },
    { key: "pricing", header: "Price", cell: (r) => r.pricing },
    {
      key: "badges",
      header: "Badges",
      cell: (r) => (r.badges.length ? r.badges.join(", ") : "—"),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "enrollments",
      header: "Learners",
      sortValue: (r) => r.enrollments,
      cell: (r) => r.enrollments,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Courses & Training"
        subtitle="Everything Enginow teaches. Courses are self-paced; training programmes run on a schedule."
        helpTitle="Courses & Training"
        helpLines={[
          "Use the two tabs to switch between self-paced courses and scheduled training programmes — they work exactly the same way.",
          "Click any row to see who has enrolled. Use 'Add a course' to create a new one.",
          role === "educator"
            ? "Anything you add is sent to an Admin for approval before it appears on the website."
            : "As an Admin you can publish straight away, and approve what educators send in.",
        ]}
        actions={
          <Button onClick={() => setDraft(blankDraft(tab))}>
            <Plus className="h-4 w-4" />
            {tab === "course" ? "Add a course" : "Add a training programme"}
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "course" | "training")} className="mb-4">
        <TabsList>
          <TabsTrigger value="course">Courses</TabsTrigger>
          <TabsTrigger value="training">Training programmes</TabsTrigger>
        </TabsList>
      </Tabs>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading courses…</p>
      ) : (
        <DataTable
          rows={visible}
          columns={columns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search by title or category"
          searchIn={(r) => `${r.title} ${r.category} ${r.createdBy}`}
          onRowClick={setViewing}
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "draft", label: "Draft" },
                { value: "pending", label: "Waiting for approval" },
                { value: "live", label: "Live" },
                { value: "archived", label: "Archived" },
              ],
              match: (r, v) => r.status === v,
            },
            {
              key: "category",
              label: "Category",
              options: CATEGORIES.map((c) => ({ value: c, label: c })),
              match: (r, v) => r.category === v,
            },
            {
              key: "pricing",
              label: "Price",
              options: [
                { value: "Free", label: "Free" },
                { value: "Premium", label: "Premium" },
              ],
              match: (r, v) => r.pricing === v,
            },
          ]}
          emptyState={
            <EmptyState
              icon={BookOpen}
              message={
                tab === "course"
                  ? "No courses here yet — add your first one and it'll show up in this list."
                  : "No training programmes here yet — add your first one and it'll show up in this list."
              }
              actionLabel={tab === "course" ? "Add your first course" : "Add your first programme"}
              onAction={() => setDraft(blankDraft(tab))}
            />
          }
        />
      )}

      {/* Detail drawer */}
      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle>{viewing.title}</SheetTitle>
                <SheetDescription>
                  {viewing.category} · {viewing.pricing} · added by {viewing.createdBy}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-8">
                <StatusBadge status={viewing.status} />
                {viewing.status === "rejected" && viewing.rejectionReason && (
                  <p className="rounded-md bg-danger-soft p-3 text-sm text-danger">
                    Sent back: {viewing.rejectionReason}
                  </p>
                )}
                <p className="text-sm">{viewing.description}</p>

                <Tabs defaultValue="content">
                  <TabsList>
                    <TabsTrigger value="content">What's inside</TabsTrigger>
                    <TabsTrigger value="learners">Enrolled learners</TabsTrigger>
                  </TabsList>
                  <TabsContent value="content" className="space-y-4 pt-4">
                    <div>
                      <p className="mb-2 text-sm font-medium">Video lessons</p>
                      <ul className="space-y-1 text-sm">
                        {viewing.videos.map((v) => (
                          <li key={v.url}>
                            <span className="text-muted-foreground">{v.notes} — </span>
                            <a href={v.url} className="text-primary underline" target="_blank" rel="noreferrer">
                              {v.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Roadmap & Curriculum</p>
                      <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                        {viewing.roadmap.map((r, idx) => (
                          <li key={idx}>
                            {typeof r === "object" && r !== null ? (
                              <span>
                                <span className="font-medium">{r.title || `Module ${idx + 1}`}</span>
                                {r.videoUrl && (
                                  <a
                                    href={r.videoUrl}
                                    className="ml-2 text-xs text-primary underline"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Watch Video
                                  </a>
                                )}
                              </span>
                            ) : (
                              <span>{String(r)}</span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </TabsContent>
                  <TabsContent value="learners" className="pt-4">
                    <p className="mb-3 text-sm text-muted-foreground">
                      {viewing.enrollments} total learners enrolled.
                    </p>
                    {viewing.learners.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nobody has enrolled yet — once this is live, learners will appear here.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Learner Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Enrolled On</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewing.learners.map((l, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{l.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{l.email}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                  {l.progress !== undefined ? `${l.progress}%` : "100%"}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs">{l.enrolledOn}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDraft({
                        id: viewing.id,
                        title: viewing.title,
                        kind: viewing.kind,
                        category: viewing.category,
                        pricing: viewing.pricing,
                        badges: viewing.badges,
                        description: viewing.description,
                        bannerUrl: viewing.bannerUrl,
                        videos: viewing.videos.length ? viewing.videos : [{ url: "", notes: "" }],
                        roadmap: viewing.roadmap.length ? viewing.roadmap : [""],
                      });
                      setViewing(null);
                    }}
                  >
                    Edit this course
                  </Button>
                  {viewing.status !== "archived" && (
                    <Button variant="outline" onClick={() => setArchiving(viewing)}>
                      Archive this course
                    </Button>
                  )}
                  {canApprove(role) && viewing.status === "pending" && (
                    <ApprovalBar
                      itemName={viewing.title}
                      onApprove={() => changeStatus.mutate({ id: viewing.id, status: "live" })}
                      onReject={(reason) =>
                        changeStatus.mutate({ id: viewing.id, status: "rejected", reason })
                      }
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create / edit form */}
      <Sheet open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {draft && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {draft.id
                    ? `Edit ${draft.title || "this course"}`
                    : draft.kind === "course"
                      ? "Add a course"
                      : "Add a training programme"}
                </SheetTitle>
                <SheetDescription>
                  Fill in what learners will see on the website. You can save it as a draft and come
                  back later.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 px-4 pb-8">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="DSA Bootcamp"
                  />
                  {errors['title'] && <p className="text-sm text-danger">{errors['title']}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="Who is this for and what will they be able to do at the end?"
                  />
                  {errors['description'] && <p className="text-sm text-danger">{errors['description']}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select
                      value={draft.category}
                      onValueChange={(v) => setDraft({ ...draft, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price</Label>
                    <Select
                      value={draft.pricing}
                      onValueChange={(v) => setDraft({ ...draft, pricing: v as "Free" | "Premium" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Badges shown on the website</span>
                  <div className="flex gap-6">
                    {["New", "Popular"].map((b) => (
                      <label key={b} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={draft.badges.includes(b)}
                          onCheckedChange={(checked) =>
                            setDraft({
                              ...draft,
                              badges: checked
                                ? [...draft.badges, b]
                                : draft.badges.filter((x) => x !== b),
                            })
                          }
                        />
                        {b}
                      </label>
                    ))}
                  </div>
                </div>

                <ImageUploader
                  value={draft.bannerUrl}
                  onChange={(url) => setDraft({ ...draft, bannerUrl: url })}
                />

                <RepeatableLinkNotes
                  items={draft.videos}
                  onChange={(videos) => setDraft({ ...draft, videos })}
                />

                <div className="space-y-2">
                  <span className="text-sm font-medium">Roadmap</span>
                  <p className="text-xs text-muted-foreground">
                    List what happens in order — learners see this as the course plan.
                  </p>
                  {draft.roadmap.map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={step}
                        aria-label={`Roadmap step ${i + 1}`}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            roadmap: draft.roadmap.map((s, idx) => (idx === i ? e.target.value : s)),
                          })
                        }
                        placeholder={`Step ${i + 1}`}
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          setDraft({ ...draft, roadmap: draft.roadmap.filter((_, idx) => idx !== i) })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDraft({ ...draft, roadmap: [...draft.roadmap, ""] })}
                  >
                    <Plus className="h-4 w-4" />
                    Add another step
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => submitDraft("draft")}>
                    Save as draft
                  </Button>
                  {role === "admin" ? (
                    <Button onClick={() => submitDraft("live")}>Publish this course</Button>
                  ) : (
                    <Button onClick={() => submitDraft("pending")}>Submit for approval</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!archiving}
        onOpenChange={(o) => !o && setArchiving(null)}
        title={`Archive "${archiving?.title ?? ""}"?`}
        consequence={`This takes the course off the website so nobody new can enrol. The ${archiving?.enrollments ?? 0} people already enrolled keep their access, and you can bring it back later.`}
        confirmLabel="Archive this course"
        cancelLabel="Keep it live"
        onConfirm={() => {
          if (archiving) changeStatus.mutate({ id: archiving.id, status: "archived" });
          setArchiving(null);
        }}
      />
    </div>
  );
}
