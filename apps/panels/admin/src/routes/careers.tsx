import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Trash2, Pencil, Check, X } from "lucide-react";
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

const DEFAULT_PERKS = [
  "Paid Time Off (PTO)",
  "Health Insurance",
  "Remote Work Options",
  "Stock Options / Equity",
  "Flexible Hours",
  "Learning Stipend",
  "Performance Bonus",
  "Gym / Wellness Allowance",
  "Annual Company Retreat",
];

const DOMAINS = [
  "Web Development",
  "Mobile App Development",
  "Backend & Cloud",
  "DevOps & Infrastructure",
  "UI/UX Design",
  "Data Science & AI",
  "Product Management",
  "Sales & Marketing",
  "Human Resources",
  "Other",
];

const EMPTY_FORM: Partial<Career> = {
  title: "",
  company: "Enginow",
  location: "Onsite",
  type: "Full-time",
  domain: "Web Development",
  salary: "Competitive",
  description: "",
  responsibilities: "",
  requirements: [],
  perks: [
    "Health Insurance",
    "Remote Work Options",
    "Paid Time Off (PTO)",
    "Flexible Hours",
  ],
  tags: "",
  status: "live",
};

function CareersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Career> & { id?: string }>(EMPTY_FORM);
  const [customPerk, setCustomPerk] = useState("");
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

  const togglePerk = (perk: string) => {
    const current = editing.perks || [];
    if (current.includes(perk)) {
      setEditing((p) => ({ ...p, perks: current.filter((x) => x !== perk) }));
    } else {
      setEditing((p) => ({ ...p, perks: [...current, perk] }));
    }
  };

  const addCustomPerk = () => {
    if (!customPerk.trim()) return;
    const current = editing.perks || [];
    if (!current.includes(customPerk.trim())) {
      setEditing((p) => ({ ...p, perks: [...current, customPerk.trim()] }));
    }
    setCustomPerk("");
  };

  const cols: Column<Career>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title,
      cell: (r) => (
        <div>
          <span className="font-medium text-foreground">{r.title}</span>
          {r.domain && (
            <span className="ml-2 inline-block rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {r.domain}
            </span>
          )}
        </div>
      ),
    },
    { key: "company", header: "Company", cell: (r) => r.company, sortValue: (r) => r.company },
    { key: "location", header: "Location", cell: (r) => r.location, sortValue: (r) => r.location },
    { key: "type", header: "Type", cell: (r) => r.type, sortValue: (r) => r.type },
    { key: "salary", header: "Salary", cell: (r) => r.salary ?? "Competitive", sortValue: (r) => r.salary ?? "" },
    {
      key: "applicants",
      header: "Applicants",
      sortValue: (r) => r.applicantsCount || 0,
      cell: (r) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {r.applicantsCount || 0}
        </span>
      ),
    },
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
              setEditing({
                ...r,
                perks: Array.isArray(r.perks) ? r.perks : [],
                requirements: Array.isArray(r.requirements) ? r.requirements : [],
              });
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

  const req = Array.isArray(editing.requirements) ? editing.requirements : [];

  return (
    <div>
      <PageHeader
        title="Careers"
        subtitle="Manage job openings and career listings on Enginow."
        helpTitle="About Careers"
        helpLines={[
          "Post full-time, part-time and freelance job opportunities with structured perks and requirements.",
          "Use the perks selector to highlight compensation benefits like Health Insurance, PTO, and Remote options.",
          "Track applicant submissions across each posted vacancy.",
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
            <SheetDescription>Fill in the role details, perks, and responsibilities.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-5 px-1 pb-8">
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
                <Label>Domain</Label>
                <Select
                  value={editing.domain ?? "Web Development"}
                  onValueChange={(v) => setEditing((p) => ({ ...p, domain: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Salary / Comp</Label>
                <Input
                  value={editing.salary ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, salary: e.target.value }))}
                  placeholder="e.g. ₹6-10 LPA"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Job Type</Label>
                <Select
                  value={editing.type ?? "Full-time"}
                  onValueChange={(v) => setEditing((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Full-time", "Part-time", "Contract", "Freelance", "Remote"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Perks Selection */}
            <div className="space-y-2 rounded-lg border p-3.5 bg-muted/20">
              <Label className="font-semibold text-sm">Perks & Compensation Benefits</Label>
              <p className="text-xs text-muted-foreground">Click to toggle benefits tags shown on the job post.</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {DEFAULT_PERKS.map((perk) => {
                  const isSelected = (editing.perks || []).includes(perk);
                  return (
                    <button
                      key={perk}
                      type="button"
                      onClick={() => togglePerk(perk)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      {perk}
                    </button>
                  );
                })}
              </div>

              {/* Any custom perks added */}
              {(editing.perks || []).filter((p) => !DEFAULT_PERKS.includes(p)).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(editing.perks || [])
                    .filter((p) => !DEFAULT_PERKS.includes(p))
                    .map((perk) => (
                      <span
                        key={perk}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 text-xs font-medium"
                      >
                        {perk}
                        <button
                          type="button"
                          onClick={() => togglePerk(perk)}
                          className="hover:opacity-75"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Input
                  size={1}
                  value={customPerk}
                  onChange={(e) => setCustomPerk(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomPerk();
                    }
                  }}
                  placeholder="Add custom perk..."
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs"
                  onClick={addCustomPerk}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                placeholder="Overview of the company and role..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Key Responsibilities (one per line)</Label>
              <Textarea
                rows={3}
                value={editing.responsibilities ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, responsibilities: e.target.value }))}
                placeholder="Design and implement core frontend features&#10;Optimize application for maximum speed and scalability&#10;Conduct code reviews"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Requirements & Qualifications (one per line)</Label>
              <Textarea
                rows={3}
                value={req.join("\n")}
                onChange={(e) =>
                  setEditing((p) => ({
                    ...p,
                    requirements: e.target.value.split("\n").filter(Boolean),
                  }))
                }
                placeholder="2+ years experience with React and TypeScript&#10;Strong understanding of RESTful APIs&#10;Experience with state management"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Skills / Keywords (comma-separated)</Label>
              <Input
                value={editing.tags ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value }))}
                placeholder="React, Next.js, TypeScript, TailwindCSS"
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
