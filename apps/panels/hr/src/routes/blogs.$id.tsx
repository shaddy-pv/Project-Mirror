import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { BlogForm } from "@/components/hr/BlogForm";
import { PageHeader } from "@/components/hr/PageHeader";
import { PendingApprovalBanner, RejectedBanner } from "@/components/hr/PendingApprovalBanner";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { api, qk } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/blogs/$id")({
  head: () => ({
    meta: [
      { title: "Edit blog post — Enginow HR" },
      {
        name: "description",
        content: "Edit a careers blog post, see its approval status and any changes Admin asked for.",
      },
      { property: "og:title", content: "Edit blog post — Enginow HR" },
      { property: "og:description", content: "Edit a post and see its approval status." },
    ],
  }),
  component: BlogDetailPage,
});

function BlogDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: blog, isLoading } = useQuery({ queryKey: qk.blog(id), queryFn: () => api.blog(id) });

  if (isLoading) {
    return <div className="px-6 py-10 text-sm text-muted-foreground">Loading post…</div>;
  }
  if (!blog) {
    return (
      <div className="px-6 py-10">
        <p className="text-sm text-muted-foreground">This post no longer exists.</p>
        <Link to="/blogs" className="mt-3 inline-block text-sm text-brand underline">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={blog.title}
        subtitle={`Created ${formatDate(blog.createdAt)} · last updated ${formatDate(blog.updatedAt)}`}
        help={[
          "Edit the post and either keep it as a draft or send it back to Admin for approval.",
          "Published posts go back to Pending approval when you change them.",
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/blogs" })}>
            <ArrowLeft /> All posts
          </Button>
        }
      />
      <div className="max-w-3xl space-y-5 px-6 py-6">
        <div className="flex items-center gap-3">
          <StatusBadge status={blog.status} />
        </div>
        {blog.status === "Pending" && <PendingApprovalBanner what="blog post" />}
        {blog.status === "Rejected" && blog.rejectionReason && (
          <RejectedBanner what="blog post" reason={blog.rejectionReason} />
        )}
        <BlogForm blog={blog} />
      </div>
    </>
  );
}
