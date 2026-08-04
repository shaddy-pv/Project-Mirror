import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const DEFAULT_PERKS = [
  "Certificate of Completion",
  "Letter of Experience (LOE)",
  "Remote Work Opportunity",
  "Mentorship Sessions",
  "Letter of Recommendation (LOR)",
  "Flexible Timing",
  "Pre-Placement Offer (PPO)",
  "Letter of Appreciation (LOA)",
  "Performance Incentives",
];

const DOMAINS = [
  "Web Development",
  "App Development",
  "UI/UX Design",
  "Data Science",
  "AI & ML",
  "Marketing",
  "Social Media",
  "Cyber Security",
  "Content Writing",
  "Business Development",
  "Other",
];

const EMPTY_FORM: Partial<Internship> = {
  title: "",
  company: "Enginow",
  location: "Remote",
  type: "Summer",
  domain: "Web Development",
  stipend: "Unpaid",
  duration: "2 Months",
  description: "",
  responsibilities: "",
  requirements: [],
  perks: [
    "Certificate of Completion",
    "Letter of Experience (LOE)",
    "Remote Work Opportunity",
    "Flexible Timing",
  ],
  tags: "",
  status: "live",
};

function InternshipsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Internship> & { id?: string }>(EMPTY_FORM);
  const [customPerk, setCustomPerk] = useState("");
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

  const cols: Column<Internship>[] = [
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
    { key: "duration", header: "Duration", cell: (r) => r.duration, sortValue: (r) => r.duration },
    { key: "stipend", header: "Stipend", cell: (r) => r.stipend || "Unpaid" },
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
        title="Internships"
        subtitle="Manage internship listings posted on the Enginow platform."
        helpTitle="About Internships"
        helpLines={[
          "Create and edit internship opportunities with structured perks, responsibilities, and requirements.",
          "Use the perks selector to attach standard tags like LOR, Certificate, and Flexible Timing.",
          "Track total student applicants directly from the dashboard table.",
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
            <SheetDescription>Configure internship details, perks, and requirements.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-5 px-1 pb-8">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={editing.title ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Full Stack Developer Intern"
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
                <Label>Type</Label>
                <Select
                  value={editing.type ?? "Summer"}
                  onValueChange={(v) => setEditing((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Summer", "Winter", "Monsoon", "Spring", "Remote", "Virtual"].map((t) => (
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
                <Label>Duration</Label>
                <Input
                  value={editing.duration ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, duration: e.target.value }))}
                  placeholder="e.g. 2 Months"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={editing.status ?? "live"}
                onValueChange={(v) => setEditing((p) => ({ ...p, status: v as Internship["status"] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live / Open for Applications</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Closed / Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Perks Selection */}
            <div className="space-y-2 rounded-lg border p-3.5 bg-muted/20">
              <Label className="font-semibold text-sm">Perks & Benefits Tags</Label>
              <p className="text-xs text-muted-foreground">Click to toggle perks that will be displayed on the listing.</p>
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
                placeholder="Overview of the internship..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Responsibilities (one per line)</Label>
              <Textarea
                rows={3}
                value={editing.responsibilities ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, responsibilities: e.target.value }))}
                placeholder="Build responsive UI with React&#10;Collaborate with design team&#10;Integrate RESTful APIs"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Requirements & Skills (one per line)</Label>
              <Textarea
                rows={3}
                value={req.join("\n")}
                onChange={(e) =>
                  setEditing((p) => ({
                    ...p,
                    requirements: e.target.value.split("\n").filter(Boolean),
                  }))
                }
                placeholder="Proficiency in React / TypeScript&#10;Familiarity with Git and Github&#10;Good communication skills"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tags / Search Keywords (comma-separated)</Label>
              <Input
                value={editing.tags ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value }))}
                placeholder="React, TypeScript, Frontend, Web"
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
