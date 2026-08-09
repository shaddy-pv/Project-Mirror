import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/educator/AppShell";
import { ConfirmDialog } from "@/components/educator/ConfirmDialog";
import { DataTable, type Column } from "@/components/educator/DataTable";
import { EmptyState } from "@/components/educator/EmptyState";
import { RoleGuard } from "@/lib/role";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { api } from "@/lib/api";
import type { Resource } from "@/lib/mock/types";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Enginow Educator" },
      { name: "description", content: "PDF handouts, cheat sheets and practice sets you've uploaded for your learners." },
      { property: "og:title", content: "Resources — Enginow Educator" },
      { property: "og:description", content: "Upload and manage your own PDF resources on Enginow." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["educator"]}>
      <ResourcesPage />
    </RoleGuard>
  ),
});

const tags = ["AI", "Development", "Data Science", "Electronics", "Core Engineering"];
const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function ResourcesPage() {
  const qc = useQueryClient();
  const resources = useQuery({ queryKey: ["resources"], queryFn: () => api.listResources() });
  const [editing, setEditing] = useState<Resource | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Resource | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => api.deleteResource(id),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Resource deleted");
    },
  });

  const columns: Array<Column<Resource>> = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">{r.fileName}</p>
        </div>
      ),
    },
    { key: "tag", header: "Tag", render: (r) => r.tag },
    { key: "uploaded", header: "Uploaded", sortable: true, sortValue: (r) => r.createdAt, render: (r) => fmt(r.createdAt) },
    {
      key: "downloads",
      header: "Downloads",
      sortable: true,
      sortValue: (r) => r.downloads,
      className: "text-right",
      render: (r) => r.downloads,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label={`Edit ${r.title}`} onClick={() => setEditing(r)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Delete ${r.title}`} onClick={() => setToDelete(r)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell
      title="Resources"
      description="PDFs you've shared with your learners."
      help={{
        title: "Resources",
        lines: [
          "Upload PDFs like cheat sheets, practice sets and rubrics. Learners download them from your courses.",
          "You can only edit or delete files you uploaded yourself.",
        ],
      }}
      actions={
        <Button onClick={() => setEditing("new")}>
          <Upload className="mr-1 size-4" /> Upload resource
        </Button>
      }
    >
      <DataTable
        rows={resources.data ?? []}
        columns={columns}
        rowKey={(r) => r.id}
        searchPlaceholder="Search by title"
        searchValue={(r) => `${r.title} ${r.fileName}`}
        filters={[
          {
            id: "tag",
            label: "Tag",
            options: tags.map((t) => ({ value: t, label: t })),
            matches: (r, v) => r.tag === v,
          },
        ]}
        emptyState={
          <EmptyState
            icon={FileText}
            line="No resources yet → Upload your first PDF."
            actionLabel="Upload resource"
            onAction={() => setEditing("new")}
          />
        }
      />

      {editing && <ResourceDialog value={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete “${toDelete?.title ?? ""}”?`}
        consequence={`${toDelete?.fileName ?? "This file"} will be removed from every course that links to it. Learners who already downloaded it keep their copy. This can't be undone.`}
        confirmLabel="Delete resource"
        onConfirm={async () => {
          if (toDelete) await remove.mutateAsync(toDelete.id);
          setToDelete(null);
        }}
      />
    </AppShell>
  );
}

function ResourceDialog({ value, onClose }: { value: Resource | null; onClose: () => void }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(value?.title ?? "");
  const [description, setDescription] = useState(value?.description ?? "");
  const [tag, setTag] = useState(value?.tag ?? "AI");
  const [fileName, setFileName] = useState(value?.fileName ?? "");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      api.saveResource({ id: value?.id, title: title.trim(), description: description.trim(), tag, fileName }),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success(value ? "Resource updated" : "Resource uploaded");
      onClose();
    },
  });

  const pick = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("That file isn't a PDF — resources must be PDF files.");
      return;
    }
    setError(null);
    setFileName(file.name);
    if (!title.trim()) setTitle(file.name.replace(/\.pdf$/i, ""));
  };

  const submit = () => {
    if (title.trim().length < 3) {
      setError("Give this resource a title of at least 3 characters.");
      return;
    }
    if (!fileName) {
      setError("Choose a PDF to upload.");
      return;
    }
    save.mutate();
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{value ? "Edit resource" : "Upload resource"}</DialogTitle>
          <DialogDescription>
            PDFs only. Learners see the title and description you write here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) pick(f);
            }}
            className="flex w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed border-border bg-secondary/40 px-4 py-8 text-sm text-muted-foreground hover:border-primary/50 hover:bg-accent"
          >
            <Upload className="size-5" />
            {fileName ? <span className="font-medium text-foreground">{fileName}</span> : <span>Drag a PDF here, or click to choose one</span>}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pick(f);
              e.target.value = "";
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="res-title">Title</Label>
            <Input id="res-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="res-desc">Description</Label>
            <Textarea id="res-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tag</Label>
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tags.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={save.isPending} onClick={submit}>
            {value ? "Save resource" : "Upload resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
