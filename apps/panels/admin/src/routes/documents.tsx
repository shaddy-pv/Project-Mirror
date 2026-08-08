import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { RoleGuard } from "@/components/panel/RoleGuard";
import { useSession } from "@/lib/session";
import { listDocuments, generateDocument } from "@/mocks/api";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Enginow Panel" },
    ],
  }),
  component: () => (
    <RoleGuard module="documents">
      <DocumentsPage />
    </RoleGuard>
  ),
});

function DocumentsPage() {
  const qc = useQueryClient();
  const { role } = useSession();
  const { data: documents = [], isPending } = useQuery({ queryKey: ["documents"], queryFn: listDocuments });
  const [draft, setDraft] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generate = useMutation({
    mutationFn: (input: any) => generateDocument(input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      setDraft(null);
      toast.success(`Document generated: ${data.certificateId}`);
    },
  });

  function submitDraft() {
    if (!draft) return;
    const next: Record<string, string> = {};
    if (!draft.recipientName?.trim()) next["recipientName"] = "Recipient name is required.";
    if (!draft.type) next["type"] = "Type is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    generate.mutate(draft);
  }

  const columns: Column<any>[] = [
    {
      key: "certificateId",
      header: "Document ID",
      sortValue: (r) => r.certificateId,
      cell: (r) => <span className="font-medium text-primary">{r.certificateId}</span>,
    },
    {
      key: "recipientName",
      header: "Recipient",
      cell: (r) => r.recipientName,
    },
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <span className="uppercase text-xs font-semibold px-2 py-1 rounded bg-muted/50 border">
          {r.type.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "internshipTitle",
      header: "Context",
      cell: (r) => r.internshipTitle || "N/A",
    },
    {
      key: "issuedAt",
      header: "Issued At",
      cell: (r) => r.issuedAt ? new Date(r.issuedAt).toLocaleDateString() : "N/A",
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end gap-2">
          {r.customDocumentBase64 ? (
            <a href={r.customDocumentBase64} download={`${r.recipientName}-${r.type}.pdf`}>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </a>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Generate and manage Offer Letters, Certificates, LORs, and LOEs for candidates."
        actions={
          <Button onClick={() => setDraft({ recipientName: "", type: "offer_letter", internshipTitle: "" })}>
            <Plus className="h-4 w-4" />
            Generate Document
          </Button>
        }
      />

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      ) : (
        <DataTable
          rows={documents}
          columns={columns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search by ID or Recipient"
          searchIn={(r) => `${r.certificateId} ${r.recipientName}`}
          filters={[
            {
              key: "type",
              label: "Type",
              options: [
                { value: "offer_letter", label: "Offer Letter" },
                { value: "completion", label: "Completion Certificate" },
                { value: "lor", label: "LOR" },
                { value: "loe", label: "LOE" },
              ],
              match: (r, v) => r.type === v,
            },
          ]}
          emptyState={
            <EmptyState
              icon={FileText}
              message="No documents generated yet."
              actionLabel="Generate your first document"
              onAction={() => setDraft({ recipientName: "", type: "offer_letter", internshipTitle: "" })}
            />
          }
        />
      )}

      <Sheet open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {draft && (
            <>
              <SheetHeader>
                <SheetTitle>Generate Document</SheetTitle>
                <SheetDescription>
                  Issue a new document to a user. This will automatically assign a unique verifiable ID.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8 mt-6">
                
                <div className="space-y-1.5">
                  <Label htmlFor="type">Document Type</Label>
                  <Select
                    value={draft.type}
                    onValueChange={(v) => setDraft({ ...draft, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offer_letter">Offer Letter</SelectItem>
                      <SelectItem value="completion">Completion Certificate</SelectItem>
                      <SelectItem value="lor">Letter of Recommendation (LOR)</SelectItem>
                      <SelectItem value="loe">Letter of Experience (LOE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={draft.recipientName || ""}
                    onChange={(e) => setDraft({ ...draft, recipientName: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                  {errors["recipientName"] && <p className="text-sm text-danger">{errors["recipientName"]}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="internshipTitle">Context (Job / Internship Title)</Label>
                  <Input
                    id="internshipTitle"
                    value={draft.internshipTitle || ""}
                    onChange={(e) => setDraft({ ...draft, internshipTitle: e.target.value })}
                    placeholder="e.g. Frontend Developer Intern"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="userId">User ID (Optional - Link to account)</Label>
                  <Input
                    id="userId"
                    value={draft.userId || ""}
                    onChange={(e) => setDraft({ ...draft, userId: e.target.value })}
                    placeholder="e.g. 64b8d9f..."
                  />
                </div>

                <div className="flex gap-2 border-t pt-4">
                  <Button onClick={submitDraft}>Generate</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
