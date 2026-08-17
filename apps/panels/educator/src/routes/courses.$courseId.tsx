import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Users } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/educator/AppShell";
import { ConfirmDialog } from "@/components/educator/ConfirmDialog";
import { CourseForm } from "@/components/educator/CourseForm";
import { EmptyState } from "@/components/educator/EmptyState";
import { PendingApprovalBanner, RejectedBanner } from "@/components/educator/PendingApprovalBanner";
import { StatusBadge } from "@/components/educator/StatusBadge";
import { RoleGuard } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

export const Route = createFileRoute("/courses/$courseId")({
  head: () => ({
    meta: [
      { title: "Course details — Enginow Educator" },
      {
        name: "description",
        content: "Edit your course, review its approval status, and see the learners enrolled in it.",
      },
      { property: "og:title", content: "Course details — Enginow Educator" },
      { property: "og:description", content: "Course overview, editing and enrolled learners in one place." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["educator"]}>
      <CourseDetail />
    </RoleGuard>
  ),
});

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function CourseDetail() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [learnerQuery, setLearnerQuery] = useState("");
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null);

  const course = useQuery({ queryKey: ["course", courseId], queryFn: () => api.getCourse(courseId) });
  const learners = useQuery({ queryKey: ["learners", courseId], queryFn: () => api.listLearners(courseId) });

  const archive = useMutation({
    mutationFn: () => api.archiveCourse(courseId),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Course archived");
    },
  });
  const remove = useMutation({
    mutationFn: () => api.deleteCourse(courseId),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Course removed");
      navigate({ to: "/courses" });
    },
  });

  if (course.isLoading) {
    return (
      <AppShell title="Course" help={{ title: "Course", lines: ["Loading this course."] }}>
        <Skeleton className="h-64 w-full max-w-3xl" />
      </AppShell>
    );
  }
  const c = course.data;
  if (!c) {
    return (
      <AppShell title="Course not found" help={{ title: "Course", lines: ["This course no longer exists."] }}>
        <EmptyState
          icon={Users}
          line="This course isn't in your list anymore."
          actionLabel="Back to Courses & Training"
          onAction={() => navigate({ to: "/courses" })}
        />
      </AppShell>
    );
  }

  const noun = c.kind === "training" ? "training program" : "course";
  const rows = (learners.data ?? []).filter((l: any) => {
    const q = learnerQuery.trim().toLowerCase();
    return !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
  });
  const enrolled = learners.data?.length ?? 0;

  return (
    <AppShell
      title={c.title}
      description={`${c.category} · ${c.pricing === "free" ? "Free" : "Premium"} · ${enrolled} enrolled learners`}
      help={{
        title: `Your ${noun}`,
        lines: [
          "Editing and resubmitting sends this back to Admin for approval — learners keep seeing the last approved version until then.",
          "The learner list is read-only. Ask Admin if someone needs removing.",
        ],
      }}
      actions={
        <>
          <Button variant="ghost" onClick={() => navigate({ to: "/courses" })}>
            <ArrowLeft className="mr-1 size-4" /> All courses
          </Button>
          {c.kind === "course" && (
            enrolled > 0 ? (
              c.status !== "archived" && (
                <Button variant="outline" onClick={() => setConfirm("archive")}>
                  Archive {noun}
                </Button>
              )
            ) : (
              <Button variant="outline" onClick={() => setConfirm("delete")}>
                Delete {noun}
              </Button>
            )
          )}
        </>
      }
    >
      <div className="space-y-5">
        {c.status === "pending" && <PendingApprovalBanner what={noun} />}
        {c.status === "rejected" && c.rejectionReason && <RejectedBanner reason={c.rejectionReason} what={noun} />}

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {c.kind === "course" && <TabsTrigger value="edit">Edit {noun}</TabsTrigger>}
            <TabsTrigger value="learners">Enrolled learners</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5 max-w-3xl space-y-5">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Status</CardTitle>
                <StatusBadge status={c.status} />
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{c.description}</p>
                <p>Last updated {fmt(c.updatedAt)}</p>
              </CardContent>
            </Card>

            {c.bannerUrl && (
              <img src={c.bannerUrl} alt={`${c.title} banner`} className="aspect-video w-full rounded-lg object-cover" />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {(c.modules || []).map((m: any) => (
                    <li key={m.id}>{m.title}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {(c.videos || []).length === 0 ? (
                  <p className="text-muted-foreground">No videos linked yet.</p>
                ) : (
                  (c.videos || []).map((v: any) => (
                    <div key={v.id}>
                      <a href={v.url} className="text-primary underline" target="_blank" rel="noreferrer">
                        {v.url}
                      </a>
                      <p className="text-muted-foreground">{v.notes}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {c.kind === "course" && (
            <TabsContent value="edit" className="mt-5">
              <CourseForm kind={c.kind} course={c} />
            </TabsContent>
          )}

          <TabsContent value="learners" className="mt-5 max-w-3xl space-y-4">
            <p className="text-sm text-muted-foreground">
              {enrolled} unique {enrolled === 1 ? "learner is" : "learners are"} enrolled in this {noun}.
            </p>
            {enrolled === 0 ? (
              <div className="rounded-lg border border-border bg-card">
                <EmptyState icon={Users} line="Nobody has enrolled yet. Learners appear here as they join." />
              </div>
            ) : (
              <>
                <div className="relative max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={learnerQuery}
                    onChange={(e) => setLearnerQuery(e.target.value)}
                    placeholder="Search learners by name or email"
                    className="bg-card pl-9"
                  />
                </div>
                <Card>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                      {rows.map((l: any) => (
                        <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                          <span className="font-medium">{l.name}</span>
                          <span className="text-muted-foreground">{l.email}</span>
                          <span className="text-muted-foreground">Enrolled {fmt(l.enrolledAt)}</span>
                        </li>
                      ))}
                      {rows.length === 0 && (
                        <li className="px-4 py-6 text-sm text-muted-foreground">No learner matches that search.</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        <p className="text-sm text-muted-foreground">
          Need something else? <Link to="/courses" className="underline">Back to your list</Link>.
        </p>
      </div>

      <ConfirmDialog
        open={confirm === "archive"}
        onOpenChange={(v) => setConfirm(v ? "archive" : null)}
        title={`Archive “${c.title}”?`}
        consequence={`This ${noun} has ${enrolled} enrolled learner${enrolled === 1 ? "" : "s"}. Archiving hides it from all of them, but keeps their progress in case you bring it back.`}
        confirmLabel="Archive course"
        onConfirm={() => archive.mutateAsync()}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onOpenChange={(v) => setConfirm(v ? "delete" : null)}
        title={`Delete “${c.title}”?`}
        consequence={`Nobody is enrolled in this ${noun}, so deleting it affects no learners. This can't be undone.`}
        confirmLabel="Delete course"
        onConfirm={() => remove.mutateAsync()}
      />
    </AppShell>
  );
}
