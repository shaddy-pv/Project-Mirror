import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DataTable, type Column } from "@/components/hr/DataTable";
import { EmptyState } from "@/components/hr/EmptyState";
import { PageHeader } from "@/components/hr/PageHeader";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api, qk } from "@/lib/api";
import type { Inquiry, InquiryStatus } from "@/lib/mock/db";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/inquiries")({
  head: () => ({
    meta: [
      { title: "Contact Inquiries — Enginow HR" },
      {
        name: "description",
        content:
          "Career and custom contact form messages from candidates, with a place to mark each one responded or closed.",
      },
      { property: "og:title", content: "Contact Inquiries — Enginow HR" },
      { property: "og:description", content: "Career and custom contact messages from candidates." },
    ],
  }),
  component: InquiriesPage,
});

function InquiriesPage() {
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: qk.inquiries,
    queryFn: api.inquiries,
  });
  const selected = inquiries.find((i) => i.id === openId);

  const setStatus = useMutation({
    mutationFn: (vars: { id: string; status: InquiryStatus }) =>
      api.updateInquiry(vars.id, { status: vars.status }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: qk.inquiries });
      toast.success(updated.status === "Responded" ? "Marked responded" : "Marked closed");
    },
    onError: () => toast.error("Couldn't update this inquiry. Please try again."),
  });

  const columns: Column<Inquiry>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    { key: "email", header: "Email", render: (r) => r.email },
    { key: "category", header: "Category", render: (r) => r.category },
    {
      key: "message",
      header: "Message",
      render: (r) => (
        <span className="line-clamp-1 max-w-[280px] text-muted-foreground">{r.message}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortValue: (r) => r.createdAt,
      render: (r) => formatDateTime(r.createdAt),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Contact Inquiries"
        subtitle="Career and custom messages sent through the website."
        help={[
          "These are messages people sent through the contact form about careers. Sales messages go to the sales team, not here.",
          "Open a message to read it in full, then mark it responded or closed so your team knows it's handled.",
        ]}
      />
      <div className="px-6 py-6">
        <DataTable
          rows={inquiries}
          columns={columns}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          searchPlaceholder="Search by name, email or message…"
          searchValue={(r) => `${r.name} ${r.email} ${r.message}`}
          filters={[
            {
              key: "status",
              label: "Statuses",
              options: ["New", "Responded", "Closed"],
              matches: (r, v) => r.status === v,
            },
            {
              key: "category",
              label: "Categories",
              options: ["Career", "Custom"],
              matches: (r, v) => r.category === v,
            },
          ]}
          onRowClick={(r) => setOpenId(r.id)}
          emptyState={
            <EmptyState
              icon={Mail}
              line="No career inquiries yet → messages sent through the careers contact form will land here."
            />
          }
        />
      </div>

      <Sheet open={Boolean(openId)} onOpenChange={(open) => !open && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.email} · {selected.category} · {formatDateTime(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <StatusBadge status={selected.status} />
                <p className="rounded-xl border bg-card p-4 text-sm">{selected.message}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={setStatus.isPending}
                    onClick={() => setStatus.mutate({ id: selected.id, status: "Responded" })}
                  >
                    Mark responded
                  </Button>
                  <Button
                    variant="outline"
                    disabled={setStatus.isPending}
                    onClick={() => setStatus.mutate({ id: selected.id, status: "Closed" })}
                  >
                    Mark closed
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
