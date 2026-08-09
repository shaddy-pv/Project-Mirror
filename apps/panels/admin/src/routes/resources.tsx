import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Folder, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { RoleGuard } from "@/components/panel/RoleGuard";
import { useSession } from "@/lib/session";
import { type Resource } from "@/lib/types";
import { listResources, saveResource, deleteResource } from "@/lib/api";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Enginow Panel" },
    ],
  }),
  component: () => (
    <RoleGuard module="resources">
      <ResourcesPage />
    </RoleGuard>
  ),
});

type Draft = Partial<Resource>;

function ResourcesPage() {
  const qc = useQueryClient();
  const { role, name } = useSession();
  const { data: resources = [], isPending } = useQuery({ queryKey: ["resources"], queryFn: listResources });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: (input: Draft) => saveResource(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resources"] });
      setDraft(null);
      toast.success("Resource saved successfully.");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteResource(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resources"] });
      toast.success("Resource deleted.");
    },
  });

  function submitDraft() {
    if (!draft) return;
    const next: Record<string, string> = {};
    if (!draft.title?.trim()) next["title"] = "Title is required.";
    if (!draft.fileUrl?.trim()) next["fileUrl"] = "File URL is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    save.mutate(draft);
  }

  const columns: Column<Resource>[] = [
    {
      key: "title",
      header: "Title & Info",
      sortValue: (r) => r.title,
      cell: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">{r.description?.slice(0, 70) || "No description"}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject / Branch",
      cell: (r) => (
        <div>
          <p>{r.subject || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{r.branch || "Any Branch"}</p>
        </div>
      ),
    },
    { key: "semester", header: "Semester", cell: (r) => r.semester || "N/A" },
    { key: "type", header: "Type", cell: (r) => r.type || "N/A" },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setDraft(r)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-danger" onClick={() => {
            if (confirm("Are you sure you want to delete this resource?")) {
              remove.mutate(r.id);
            }
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Resources"
        subtitle="Manage academic materials like Previous Year Questions, notes, and study guides."
        actions={
          <Button onClick={() => setDraft({ title: "", description: "", fileUrl: "", subject: "", branch: "", semester: "", type: "PYQ" })}>
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        }
      />

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading resources…</p>
      ) : (
        <DataTable
          rows={resources}
          columns={columns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search resources"
          searchIn={(r) => `${r.title} ${r.subject} ${r.branch} ${r.type}`}
          filters={[
            {
              key: "type",
              label: "Type",
              options: [
                { value: "PYQ", label: "PYQ" },
                { value: "Notes", label: "Notes" },
                { value: "Study Guide", label: "Study Guide" },
              ],
              match: (r, v) => r.type === v,
            },
          ]}
          emptyState={
            <EmptyState
              icon={Folder}
              message="No resources uploaded yet."
              actionLabel="Upload your first resource"
              onAction={() => setDraft({ title: "", description: "", fileUrl: "", subject: "", branch: "", semester: "", type: "PYQ" })}
            />
          }
        />
      )}

      <Sheet open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {draft && (
            <>
              <SheetHeader>
                <SheetTitle>{draft.id ? "Edit Resource" : "Add Resource"}</SheetTitle>
                <SheetDescription>
                  Upload and categorize academic resources.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8 mt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={draft.title || ""}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="e.g. Data Structures 2023 PYQ"
                  />
                  {errors["title"] && <p className="text-sm text-danger">{errors["title"]}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={draft.description || ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fileUrl">File URL (PDF/Drive Link)</Label>
                  <Input
                    id="fileUrl"
                    value={draft.fileUrl || ""}
                    onChange={(e) => setDraft({ ...draft, fileUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  {errors["fileUrl"] && <p className="text-sm text-danger">{errors["fileUrl"]}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={draft.subject || ""}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                      placeholder="e.g. DBMS"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      value={draft.branch || ""}
                      onChange={(e) => setDraft({ ...draft, branch: e.target.value })}
                      placeholder="e.g. CSE"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      value={draft.semester || ""}
                      onChange={(e) => setDraft({ ...draft, semester: e.target.value })}
                      placeholder="e.g. 5th Sem"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="type">Type</Label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={draft.type || "PYQ"}
                      onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                    >
                      <option value="PYQ">PYQ</option>
                      <option value="Notes">Notes</option>
                      <option value="Study Guide">Study Guide</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 border-t pt-4">
                  <Button onClick={submitDraft}>Save Resource</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
