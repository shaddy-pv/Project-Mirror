import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Trash2, Pencil } from "lucide-react";
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
import { StatusBadge } from "@/components/panel/StatusBadge";
import { ConfirmDialog } from "@/components/panel/ConfirmDialog";
import type { Career } from "@/lib/types";
import { listCareers, saveCareer, deleteCareer } from "@/mocks/api";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [{ title: "Careers — Enginow Panel" }] }),
  component: CareersPage,
});

const EMPTY_FORM: Partial<Career> = {
  title: "",
  company: "Enginow",
  location: "Onsite",
  type: "Full-time",
  salary: "Competitive",
  description: "",
  requirements: [],
  status: "live",
};

function CareersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Career> & { id?: string }>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: careers = [], isPending } = useQuery({
    queryKey: ["admin-careers"],
    queryFn: listCareers,
  });

  const saveMut = useMutation({
    mutationFn: saveCareer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-careers"] });
      toast.success(editing.id ? "Job opening updated" : "Job opening created");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCareer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-careers"] });
      toast.success("Job opening deleted");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cols: Column<Career>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title,
      cell: (r) => <span className="font-medium">{r.title}</span>,
    },
    { key: "company", header: "Company", cell: (r) => r.company, sortValue: (r) => r.company },
    { key: "location", header: "Location", cell: (r) => r.location, sortValue: (r) => r.location },
    { key: "type", header: "Type", cell: (r) => r.type, sortValue: (r) => r.type },
    { key: "salary", header: "Salary", cell: (r) => r.salary ?? "Competitive", sortValue: (r) => r.salary ?? "" },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status || "live"} />,
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setEditing({ ...r });
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteId(r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const req = editing.requirements ?? [];

  return (
    <div>
      <PageHeader
        title="Careers"
        subtitle="Manage job openings and career listings on Enginow."
        helpTitle="About Careers"
        helpLines={[
          "Post full-time, part-time and freelance job opportunities.",
          "Include role responsibilities and perks to attract talent.",
        ]}
        actions={
          <Button
            onClick={() => {
              setEditing(EMPTY_FORM);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Job Opening
          </Button>
        }
      />

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading career openings…</p>
      ) : (
        <DataTable
          rows={careers}
          columns={cols}
          rowKey={(r) => r.id}
          searchPlaceholder="Search by title, domain, or location"
          searchIn={(r) => `${r.title} ${r.company} ${r.domain || ""} ${r.location}`}
          emptyState={
            <EmptyState
              icon={Building2}
              message="No job openings found. Click 'Add Job Opening' to create one."
            />
          }
        />
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editing.id ? "Edit Job Opening" : "New Job Opening"}</SheetTitle>
            <SheetDescription>Fill in the role details below.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 px-1 pb-8">
            <div className="space-y-1.5">
              <Label>Job Title</Label>
              <Input
                value={editing.title ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Junior Software Developer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input
                  value={editing.company ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, company: e.target.value }))}
                  placeholder="Enginow"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Salary / Comp</Label>
                <Input
                  value={editing.salary ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, salary: e.target.value }))}
                  placeholder="e.g. ₹6-10 LPA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Job Type</Label>
                <Select
                  value={editing.type ?? "Full-time"}
                  onValueChange={(v) => setEditing((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Full-time", "Part-time", "Contract", "Freelance"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Select
                  value={editing.location ?? "Onsite"}
                  onValueChange={(v) => setEditing((p) => ({ ...p, location: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Onsite", "Remote", "Hybrid"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={editing.status ?? "live"}
                onValueChange={(v) => setEditing((p) => ({ ...p, status: v as Career["status"] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live / Open</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Closed / Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={editing.description ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the responsibilities and background..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Requirements & Perks (one per line)</Label>
              <Textarea
                rows={4}
                value={req.join("\n")}
                onChange={(e) =>
                  setEditing((p) => ({
                    ...p,
                    requirements: e.target.value.split("\n").filter(Boolean),
                  }))
                }
                placeholder="2+ years React / Node.js&#10;Clean coding practices&#10;Health Insurance"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => saveMut.mutate(editing)}
              disabled={saveMut.isPending || !editing.title}
            >
              {saveMut.isPending ? "Saving…" : editing.id ? "Save Changes" : "Create Job Opening"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete job opening?"
        consequence="This will permanently remove the career listing from the website."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteMut.mutate(deleteId);
        }}
      />
    </div>
  );
}
