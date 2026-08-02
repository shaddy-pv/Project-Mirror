import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { EmptyState } from "@/components/panel/EmptyState";
import { PageHeader } from "@/components/panel/PageHeader";
import { RoleGuard } from "@/components/panel/RoleGuard";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { ApprovalBar } from "@/components/panel/ApprovalBar";
import { ImageUploader } from "@/components/panel/ImageUploader";
import { RichTextEditor } from "@/components/panel/RichTextEditor";
import { canApprove, useSession } from "@/lib/session";
import { ROLE_LABELS, type Blog } from "@/lib/types";
import { listBlogs, saveBlog, setBlogStatus } from "@/mocks/api";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "Blogs — Enginow Panel" },
      { name: "description", content: "Write, edit and publish articles for the Enginow website." },
      { property: "og:title", content: "Blogs — Enginow Panel" },
      {
        property: "og:description",
        content: "Write, edit and publish articles for the Enginow website.",
      },
    ],
  }),
  component: () => (
    <RoleGuard module="blogs">
      <BlogsPage />
    </RoleGuard>
  ),
});

type Draft = {
  id?: string;
  title: string;
  excerpt: string;
  body: string;
  bannerUrl?: string | undefined;
};

function BlogsPage() {
  const qc = useQueryClient();
  const { role, name } = useSession();
  const { data: blogs = [], isPending } = useQuery({ queryKey: ["blogs"], queryFn: listBlogs });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [viewing, setViewing] = useState<Blog | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visible = role === "admin" ? blogs : blogs.filter((b) => b.author === name);

  const save = useMutation({
    mutationFn: (input: Partial<Blog> & { id?: string }) => saveBlog(input),
    onSuccess: (blog) => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      setDraft(null);
      toast.success(
        blog.status === "pending"
          ? `"${blog.title}" sent for approval`
          : blog.status === "live"
            ? `"${blog.title}" published`
            : `"${blog.title}" saved as a draft`,
      );
    },
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: Blog["status"]; reason?: string }) =>
      setBlogStatus(id, status, reason),
    onSuccess: (blog, vars) => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
      setViewing(blog);
      toast.success(
        vars.status === "live"
          ? `"${blog.title}" published`
          : `"${blog.title}" sent back to the author`,
      );
    },
  });

  function submitDraft(status: "draft" | "pending" | "live") {
    if (!draft) return;
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next["title"] = "Give this article a title.";
    if (draft.excerpt.trim().length < 15)
      next["excerpt"] = "Write a one-line summary so readers know what this is about.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    save.mutate(draft.id ? { ...draft, status } : { ...draft, status, author: name, authorRole: role });
  }

  const columns: Column<Blog>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title,
      cell: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">{r.excerpt.slice(0, 70)}…</p>
        </div>
      ),
    },
    {
      key: "author",
      header: "Written by",
      cell: (r) => (
        <div>
          <p>{r.author}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABELS[r.authorRole]}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "updated", header: "Last edited", sortValue: (r) => r.updated, cell: (r) => r.updated },
    {
      key: "reactions",
      header: "Likes / Shares / Saves",
      cell: (r) => `${r.likes} / ${r.shares} / ${r.saves}`,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Blogs"
        subtitle="Articles published on the Enginow website. Anyone on the team can write one."
        helpTitle="Blogs"
        helpLines={[
          "Click 'Write an article' to start. Save it as a draft any time — nothing goes public until it's approved.",
          "Click any row to read it, see how it's performing, or make changes.",
          role === "admin"
            ? "Articles from the team arrive here as 'Waiting for approval'. Approve them, or send them back with a note about what to change."
            : "When you submit, an Admin reviews it. If it comes back, you'll see exactly what needs changing.",
        ]}
        actions={
          <Button onClick={() => setDraft({ title: "", excerpt: "", body: "" })}>
            <Plus className="h-4 w-4" />
            Write an article
          </Button>
        }
      />

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading articles…</p>
      ) : (
        <DataTable
          rows={visible}
          columns={columns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search by title or author"
          searchIn={(r) => `${r.title} ${r.author} ${r.excerpt}`}
          onRowClick={setViewing}
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "draft", label: "Draft" },
                { value: "pending", label: "Waiting for approval" },
                { value: "live", label: "Published" },
                { value: "rejected", label: "Sent back" },
              ],
              match: (r, v) => r.status === v,
            },
            {
              key: "authorRole",
              label: "Team",
              options: (["admin", "educator", "hr", "sales"] as const).map((r) => ({
                value: r,
                label: ROLE_LABELS[r],
              })),
              match: (r, v) => r.authorRole === v,
            },
          ]}
          emptyState={
            <EmptyState
              icon={FileText}
              message="No articles here yet — write your first one and it'll show up in this list."
              actionLabel="Write your first article"
              onAction={() => setDraft({ title: "", excerpt: "", body: "" })}
            />
          }
        />
      )}

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle>{viewing.title}</SheetTitle>
                <SheetDescription>
                  {viewing.author} · {ROLE_LABELS[viewing.authorRole]} · last edited {viewing.updated}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <StatusBadge status={viewing.status} />
                {viewing.status === "rejected" && viewing.rejectionReason && (
                  <p className="rounded-md bg-danger-soft p-3 text-sm text-danger">
                    Sent back: {viewing.rejectionReason}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{viewing.excerpt}</p>
                <div
                  className="tiptap-body text-sm"
                  dangerouslySetInnerHTML={{ __html: viewing.body }}
                />
                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDraft({
                        id: viewing.id,
                        title: viewing.title,
                        excerpt: viewing.excerpt,
                        body: viewing.body,
                        bannerUrl: viewing.bannerUrl,
                      });
                      setViewing(null);
                    }}
                  >
                    Edit this article
                  </Button>
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

      <Sheet open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          {draft && (
            <>
              <SheetHeader>
                <SheetTitle>{draft.id ? "Edit this article" : "Write an article"}</SheetTitle>
                <SheetDescription>
                  Write it here, then save it as a draft or send it for approval.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <div className="space-y-1.5">
                  <Label htmlFor="blog-title">Title</Label>
                  <Input
                    id="blog-title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="How to actually finish a DSA sheet"
                  />
                  {errors["title"] && <p className="text-sm text-danger">{errors["title"]}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="blog-excerpt">One-line summary</Label>
                  <Textarea
                    id="blog-excerpt"
                    rows={2}
                    value={draft.excerpt}
                    onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                    placeholder="Shown under the title on the website."
                  />
                  {errors["excerpt"] && <p className="text-sm text-danger">{errors["excerpt"]}</p>}
                </div>
                <ImageUploader
                  label="Banner image (optional)"
                  value={draft.bannerUrl}
                  onChange={(url) => setDraft({ ...draft, bannerUrl: url })}
                />
                <div className="space-y-1.5">
                  <span className="text-sm font-medium">Article</span>
                  <RichTextEditor
                    value={draft.body}
                    onChange={(body) => setDraft((d) => (d ? { ...d, body } : d))}
                  />
                </div>
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => submitDraft("draft")}>
                    Save as draft
                  </Button>
                  {role === "admin" ? (
                    <Button onClick={() => submitDraft("live")}>Publish this article</Button>
                  ) : (
                    <Button onClick={() => submitDraft("pending")}>Submit for approval</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
