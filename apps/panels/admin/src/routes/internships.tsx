import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, Trash2, Pencil } from "lucide-react";
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
import type { Internship } from "@/lib/types";
import { listInternships, saveInternship, deleteInternship } from "@/mocks/api";

export const Route = createFileRoute("/internships")({
  head: () => ({ meta: [{ title: "Internships — Enginow Panel" }] }),
  component: InternshipsPage,
});

const EMPTY_FORM: Partial<Internship> = {
  title: "",
  company: "Enginow",
  location: "Remote",
  type: "Summer",
  stipend: "Unpaid",
  duration: "2 Months",
  description: "",
  requirements: [],
  status: "live",
};

function InternshipsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Internship> & { id?: string }>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: internships = [], isPending } = useQuery({
    queryKey: ["admin-internships"],
    queryFn: listInternships,
  });

  const saveMut = useMutation({
    mutationFn: saveInternship,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-internships"] });
      toast.success(editing.id ? "Internship updated" : "Internship created");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteInternship,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-internships"] });
      toast.success("Internship deleted");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cols: Column<Internship>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title,
      cell: (r) => <span className="font-medium">{r.title}</span>,
    },
    { key: "company", header: "Company", cell: (r) => r.company, sortValue: (r) => r.company },
    { key: "location", header: "Location", cell: (r) => r.location, sortValue: (r) => r.location },
    { key: "type", header: "Type", cell: (r) => r.type, sortValue: (r) => r.type },
    { key: "duration", header: "Duration", cell: (r) => r.duration, sortValue: (r) => r.duration },
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
        title="Internships"
        subtitle="Manage internship listings posted on the Enginow platform."
        helpTitle="About Internships"
        helpLines={[
          "Create and edit internship opportunities for students and early professionals.",
          "Use the status switch to open or archive listings at any time.",
        ]}
        actions={
          <Button
            onClick={() => {
              setEditing(EMPTY_FORM);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Internship
          </Button>
        }
      />

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading internships…</p>
      ) : (
        <DataTable
          rows={internships}
          columns={cols}
          rowKey={(r) => r.id}
          searchPlaceholder="Search by title, company, or domain"
          searchIn={(r) => `${r.title} ${r.company} ${r.domain || ""} ${r.type}`}
          emptyState={
            <EmptyState
              icon={Briefcase}
              message="No internship listings found. Click 'Add Internship' to create one."
            />
          }
        />
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editing.id ? "Edit Internship" : "New Internship"}</SheetTitle>
            <SheetDescription>Fill in the internship details below.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 px-1 pb-8">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={editing.title ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. App Developer (React Native/Flutter) Internship"
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
                <Label>Duration</Label>
                <Input
                  value={editing.duration ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, duration: e.target.value }))}
                  placeholder="e.g. 2 Months"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={editing.type ?? "Summer"}
                  onValueChange={(v) => setEditing((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Summer", "Winter", "Monsoon", "Spring", "Remote"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Select
                  value={editing.location ?? "Remote"}
                  onValueChange={(v) => setEditing((p) => ({ ...p, location: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Remote", "Onsite", "Hybrid"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Stipend</Label>
                <Input
                  value={editing.stipend ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, stipend: e.target.value }))}
                  placeholder="e.g. Unpaid or ₹5,000/mo"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={editing.status ?? "live"}
                  onValueChange={(v) => setEditing((p) => ({ ...p, status: v as Internship["status"] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live / Open</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Closed / Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={editing.description ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the internship role..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Requirements (one per line)</Label>
              <Textarea
                rows={4}
                value={req.join("\n")}
                onChange={(e) =>
                  setEditing((p) => ({
                    ...p,
                    requirements: e.target.value.split("\n").filter(Boolean),
                  }))
                }
                placeholder="Flutter / React Native&#10;Git and GitHub&#10;Problem solving skills"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => saveMut.mutate(editing)}
              disabled={saveMut.isPending || !editing.title}
            >
              {saveMut.isPending ? "Saving…" : editing.id ? "Save Changes" : "Create Internship"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete internship?"
        consequence="This will permanently remove the listing from the platform."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteMut.mutate(deleteId);
        }}
      />
    </div>
  );
}
