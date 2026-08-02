import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Newspaper } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/educator/AppShell";
import { BlogForm } from "@/components/educator/BlogForm";
import { ConfirmDialog } from "@/components/educator/ConfirmDialog";
import { EmptyState } from "@/components/educator/EmptyState";
import { PendingApprovalBanner, RejectedBanner } from "@/components/educator/PendingApprovalBanner";
import { StatusBadge } from "@/components/educator/StatusBadge";
import { RoleGuard } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

export const Route = createFileRoute("/blogs/$blogId")({
  head: () => ({
    meta: [
      { title: "Blog post — Enginow Educator" },
      { name: "description", content: "Read, edit and resubmit one of your Enginow blog posts." },
      { property: "og:title", content: "Blog post — Enginow Educator" },
      { property: "og:description", content: "Post preview, approval status and editing in one place." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["educator"]}>
      <BlogDetail />
    </RoleGuard>
  ),
});

function BlogDetail() {
  const { blogId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const blog = useQuery({ queryKey: ["blog", blogId], queryFn: () => api.getBlog(blogId) });
  const remove = useMutation({
    mutationFn: () => api.deleteBlog(blogId),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Blog post deleted");
      navigate({ to: "/blogs" });
    },
  });

  if (blog.isLoading) {
    return (
      <AppShell title="Blog post" help={{ title: "Blog post", lines: ["Loading this post."] }}>
        <Skeleton className="h-64 w-full max-w-3xl" />
      </AppShell>
    );
  }
  const b = blog.data;
  if (!b) {
    return (
      <AppShell title="Post not found" help={{ title: "Blog post", lines: ["This post no longer exists."] }}>
        <EmptyState
          icon={Newspaper}
          line="This post isn't in your list anymore."
          actionLabel="Back to Blogs"
          onAction={() => navigate({ to: "/blogs" })}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={b.title}
      description={b.excerpt}
      help={{
        title: "Your blog post",
        lines: [
          "Editing a published post sends the new version back to Admin before readers see it.",
          "Rejection notes always explain what to change.",
        ],
      }}
      actions={
        <>
          <Button variant="ghost" onClick={() => navigate({ to: "/blogs" })}>
            <ArrowLeft className="mr-1 size-4" /> All blogs
          </Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            Delete post
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {b.status === "pending" && <PendingApprovalBanner what="blog post" />}
        {b.status === "rejected" && b.rejectionReason && (
          <RejectedBanner reason={b.rejectionReason} what="blog post" />
        )}

        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="edit">Edit post</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-5 max-w-3xl space-y-4">
            <StatusBadge status={b.status} />
            {b.bannerUrl && (
              <img src={b.bannerUrl} alt={`${b.title} banner`} className="aspect-video w-full rounded-lg object-cover" />
            )}
            <article
              className="rounded-lg border border-border bg-card px-5 py-4 text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:rounded-md [&_pre]:bg-secondary [&_pre]:p-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: b.body }}
            />
          </TabsContent>

          <TabsContent value="edit" className="mt-5">
            <BlogForm blog={b} />
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete “${b.title}”?`}
        consequence={
          b.status === "published"
            ? "This post is live on the Enginow blog. Deleting it removes it for every reader and can't be undone."
            : "This post hasn't been published, so no readers are affected. This can't be undone."
        }
        confirmLabel="Delete post"
        onConfirm={() => remove.mutateAsync()}
      />
    </AppShell>
  );
}
