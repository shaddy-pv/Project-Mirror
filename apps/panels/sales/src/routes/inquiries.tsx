import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/sales/AppShell";
import { DataTable, type Column } from "@/components/sales/DataTable";
import { EmptyState } from "@/components/sales/EmptyState";
import { HelpDrawer } from "@/components/sales/HelpDrawer";
import { StatusBadge } from "@/components/sales/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchInquiries, updateInquiryStatus } from "@/lib/sales-api";
import type { Inquiry, InquiryStatus } from "@/lib/sales-data";

export const Route = createFileRoute("/inquiries")({
  head: () => ({
    meta: [
      { title: "Contact Inquiries — Enginow Sales" },
      {
        name: "description",
        content: "Sales enquiries from the Enginow website: read the message, reply, and mark it responded or closed.",
      },
      { property: "og:title", content: "Contact Inquiries — Enginow Sales" },
      { property: "og:description", content: "Sales enquiries from the Enginow website, with status tracking." },
    ],
  }),
  component: InquiriesPage,
});

const HELP = [
  { title: "What's in this list", body: "Only enquiries people sent through the Sales form on the website. Career and other enquiries go to different teams." },
  { title: "Status", body: "New means nobody has replied yet. Responded means you've written back. Closed means the conversation is finished." },
];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function InquiriesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<Inquiry | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | InquiryStatus>("all");

  const { data, isPending } = useQuery({ queryKey: ["inquiries"], queryFn: fetchInquiries });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) => updateInquiryStatus(id, status),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      setOpen(updated);
      toast.success(`Marked as ${updated.status.toLowerCase()}`);
    },
  });

  const rows = (data ?? []).filter((i) => statusFilter === "all" || i.status === statusFilter);

  const columns: Column<Inquiry>[] = [
    { key: "name", header: "Name", sortable: true, value: (r) => r.name, className: "font-medium" },
    { key: "email", header: "Email", sortable: true, value: (r) => r.email, className: "text-muted-foreground" },
    {
      key: "message",
      header: "Message",
      cell: (r) => <span className="line-clamp-1 max-w-[380px] text-muted-foreground">{r.message}</span>,
    },
    { key: "date", header: "Date", sortable: true, value: (r) => +new Date(r.date), cell: (r) => fmtDate(r.date) },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppShell
      title="Contact Inquiries"
      subtitle="People who asked about courses through the website"
      actions={
        <HelpDrawer title="About these enquiries" intro="What this list holds and what each status means." items={HELP} />
      }
    >
      {isPending ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <DataTable
          rows={rows}
          columns={columns}
          searchPlaceholder="Search by name, email or message…"
          searchKeys={(r) => `${r.name} ${r.email} ${r.message}`}
          onRowClick={setOpen}
          toolbar={
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-[170px] bg-card" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Responded">Responded</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          }
          emptyState={
            <EmptyState
              icon={MessageSquare}
              message="No enquiries to show here yet."
              hint="Try clearing the search or choosing a different status."
            />
          }
        />
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open ? (
            <>
              <SheetHeader>
                <SheetTitle>{open.name}</SheetTitle>
                <SheetDescription>
                  Sent {fmtDate(open.date)} · Sales enquiry
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <div className="flex items-center gap-2">
                  <StatusBadge status={open.status} />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Email</p>
                  <a href={`mailto:${open.email}`} className="font-medium text-primary underline-offset-2 hover:underline">
                    {open.email}
                  </a>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{open.phone}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Message</p>
                  <p className="rounded-lg bg-secondary p-3 leading-relaxed">{open.message}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild variant="outline">
                    <a href={`mailto:${open.email}`}>
                      <Mail className="size-4" /> Reply by email
                    </a>
                  </Button>
                  <Button
                    disabled={open.status === "Responded" || mutation.isPending}
                    onClick={() => mutation.mutate({ id: open.id, status: "Responded" })}
                  >
                    Mark responded
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={open.status === "Closed" || mutation.isPending}
                    onClick={() => mutation.mutate({ id: open.id, status: "Closed" })}
                  >
                    Mark closed
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
