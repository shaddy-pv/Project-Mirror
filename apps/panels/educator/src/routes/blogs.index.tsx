import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Plus } from "lucide-react";

import { AppShell } from "@/components/educator/AppShell";
import { DataTable, type Column } from "@/components/educator/DataTable";
import { EmptyState } from "@/components/educator/EmptyState";
import { StatusBadge } from "@/components/educator/StatusBadge";
import { RoleGuard } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Blog } from "@/lib/mock/types";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      { title: "Blogs — Enginow Educator" },
      { name: "description", content: "Your Enginow blog posts, from draft to published, with Admin feedback in plain language." },
      { property: "og:title", content: "Blogs — Enginow Educator" },
      { property: "og:description", content: "Write, submit and track your Enginow blog posts." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["educator"]}>
      <BlogsPage />
    </RoleGuard>
  ),
});

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function BlogsPage() {
  const navigate = useNavigate();
  const blogs = useQuery({ queryKey: ["blogs"], queryFn: () => api.listBlogs() });

  const columns: Array<Column<Blog>> = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          {r.status === "rejected" && r.rejectionReason && (
            <p className="mt-1 max-w-md text-xs text-destructive">Admin sent this back: {r.rejectionReason}</p>
          )}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "created", header: "Created", sortable: true, sortValue: (r) => r.createdAt, render: (r) => fmt(r.createdAt) },
    { key: "updated", header: "Updated", sortable: true, sortValue: (r) => r.updatedAt, render: (r) => fmt(r.updatedAt) },
  ];

  return (
    <AppShell
      title="Blogs"
      description="Posts you've written for the Enginow blog."
      help={{
        title: "Blogs",
        lines: [
          "Drafts stay private. Submitting a post sends it to Admin for approval.",
          "If a post is sent back, the reason appears right here on its row.",
        ],
      }}
      actions={
        <Button onClick={() => navigate({ to: "/blogs/new" })}>
          <Plus className="mr-1 size-4" /> Write blog post
        </Button>
      }
    >
      <DataTable
        rows={blogs.data ?? []}
        columns={columns}
        rowKey={(r) => r.id}
        searchPlaceholder="Search by title"
        searchValue={(r) => r.title}
        onRowClick={(r) => navigate({ to: "/blogs/$blogId", params: { blogId: r.id } })}
        filters={[
          {
            id: "status",
            label: "Status",
            options: [
              { value: "draft", label: "Draft" },
              { value: "pending", label: "Pending approval" },
              { value: "published", label: "Published" },
              { value: "rejected", label: "Rejected" },
            ],
            matches: (r, v) => r.status === v,
          },
        ]}
        emptyState={
          <EmptyState
            icon={Newspaper}
            line="No blog posts yet → Write your first post."
            actionLabel="Write blog post"
            onAction={() => navigate({ to: "/blogs/new" })}
          />
        }
      />
    </AppShell>
  );
}
