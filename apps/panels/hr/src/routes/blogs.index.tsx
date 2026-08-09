import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Newspaper, Plus } from "lucide-react";

import { DataTable, type Column } from "@/components/hr/DataTable";
import { EmptyState } from "@/components/hr/EmptyState";
import { PageHeader } from "@/components/hr/PageHeader";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { api, qk } from "@/lib/api";
import type { Blog } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      { title: "Blogs — Enginow HR" },
      {
        name: "description",
        content: "Write hiring and careers blog posts and send them to Admin for approval.",
      },
      { property: "og:title", content: "Blogs — Enginow HR" },
      { property: "og:description", content: "Write blog posts and send them for approval." },
    ],
  }),
  component: BlogsPage,
});

function BlogsPage() {
  const navigate = useNavigate();
  const { data: blogs = [], isLoading } = useQuery({ queryKey: qk.blogs, queryFn: api.blogs });

  const columns: Column<Blog>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title,
      render: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          {r.status === "rejected" && r.rejectionReason && (
            <p className="mt-0.5 text-xs text-danger">Admin asked for changes: {r.rejectionReason}</p>
          )}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "created",
      header: "Created",
      sortValue: (r) => r.createdAt,
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: "updated",
      header: "Updated",
      sortValue: (r) => r.updatedAt,
      render: (r) => formatDate(r.updatedAt),
    },
  ];

  return (
    <>
      <PageHeader
        title="Blogs"
        subtitle="Posts you've written for the careers section."
        help={[
          "Write posts here. When you send one for approval, an Admin reviews it before it's published.",
          "If Admin asks for changes, the reason shows on the post's row so you know what to fix.",
        ]}
        actions={
          <Button onClick={() => navigate({ to: "/blogs/new" })}>
            <Plus /> Write blog post
          </Button>
        }
      />
      <div className="px-6 py-6">
        <DataTable
          rows={blogs}
          columns={columns}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          searchPlaceholder="Search by title…"
          searchValue={(r) => r.title}
          filters={[
            {
              key: "status",
              label: "Statuses",
              options: ["Draft", "Pending", "Published", "Rejected"],
              matches: (r, v) => r.status === v,
            },
          ]}
          onRowClick={(r) => navigate({ to: "/blogs/$id", params: { id: r.id } })}
          emptyState={
            <EmptyState
              icon={Newspaper}
              line="No blog posts yet → write your first post about hiring at Enginow."
              actionLabel="Write blog post"
              onAction={() => navigate({ to: "/blogs/new" })}
            />
          }
        />
      </div>
    </>
  );
}
