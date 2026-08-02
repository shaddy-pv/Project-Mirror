import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { CodeChip } from "@/components/panel/CodeChip";
import { ConfirmDialog } from "@/components/panel/ConfirmDialog";
import { EmptyState } from "@/components/panel/EmptyState";
import { PageHeader } from "@/components/panel/PageHeader";
import { RoleGuard } from "@/components/panel/RoleGuard";
import { StatusBadge } from "@/components/panel/StatusBadge";
import { listUsers, regenerateReferralCode, setUserActive } from "@/mocks/api";
import type { PanelUser } from "@/lib/types";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users & Referrals — Enginow Panel" },
      {
        name: "description",
        content: "Look up any learner, see their referral code and who signed up through it.",
      },
      { property: "og:title", content: "Users & Referrals — Enginow Panel" },
      {
        property: "og:description",
        content: "Look up any learner, see their referral code and who signed up through it.",
      },
    ],
  }),
  component: () => (
    <RoleGuard module="users">
      <UsersPage />
    </RoleGuard>
  ),
});

function UsersPage() {
  const qc = useQueryClient();
  const { data: users = [], isPending } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const [selected, setSelected] = useState<PanelUser | null>(null);
  const [deactivating, setDeactivating] = useState<PanelUser | null>(null);
  const [regenerating, setRegenerating] = useState<PanelUser | null>(null);

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setUserActive(id, active),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setSelected(user);
      toast.success(user.active ? `${user.name} reactivated` : `${user.name} deactivated`);
    },
  });

  const regenerate = useMutation({
    mutationFn: (id: string) => regenerateReferralCode(id),
    onSuccess: (code) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setSelected((prev) => (prev ? { ...prev, referralCode: code } : prev));
      toast.success("New referral code created");
    },
  });

  const columns: Column<PanelUser>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (r) => r.name,
      cell: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Type", cell: (r) => r.role },
    {
      key: "code",
      header: "Referral code",
      cell: (r) => <CodeChip code={r.referralCode} label="Referral code" />,
    },
    {
      key: "referrals",
      header: "People referred",
      sortValue: (r) => r.referralsMade,
      cell: (r) => r.referralsMade,
    },
    { key: "joined", header: "Joined", sortValue: (r) => r.joined, cell: (r) => r.joined },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.active ? "active" : "deactivated"} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users & Referrals"
        subtitle="Everyone who has signed up on the Enginow website, and the referral codes they share."
        helpTitle="Users & Referrals"
        helpLines={[
          "Search for anyone who signed up, then click their row to see their courses, applications, certificates and referral history.",
          "Referral codes are created automatically and can't be typed by hand. Only an Admin can replace one.",
          "People are never deleted here — deactivate them instead, so their referral and course history stays intact.",
        ]}
      />

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading people…</p>
      ) : (
        <DataTable
          rows={users}
          columns={columns}
          rowKey={(r) => r.id}
          searchPlaceholder="Search by name, email or referral code"
          searchIn={(r) => `${r.name} ${r.email} ${r.referralCode}`}
          onRowClick={setSelected}
          filters={[
            {
              key: "role",
              label: "Type",
              options: [
                { value: "Learner", label: "Learner" },
                { value: "Intern", label: "Intern" },
                { value: "Applicant", label: "Applicant" },
              ],
              match: (r, v) => r.role === v,
            },
            {
              key: "status",
              label: "Status",
              options: [
                { value: "active", label: "Active" },
                { value: "deactivated", label: "Deactivated" },
              ],
              match: (r, v) => (v === "active" ? r.active : !r.active),
            },
            {
              key: "joined",
              label: "Joined",
              options: [
                { value: "30", label: "Last 30 days" },
                { value: "90", label: "Last 3 months" },
                { value: "365", label: "Last year" },
              ],
              match: (r, v) => {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - Number(v));
                return new Date(r.joined) >= cutoff;
              },
            },
          ]}
          emptyState={
            <EmptyState
              icon={UsersIcon}
              message="Nobody matches what you searched for. Try a shorter search or clear the filters."
            />
          }
        />
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.email} · joined {selected.joined}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.active ? "active" : "deactivated"} />
                  <CodeChip code={selected.referralCode} label="Referral code" />
                </div>

                <Tabs defaultValue="profile">
                  <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="referrals">Referral activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-5 pt-4">
                    <Section title="Courses they joined" items={selected.courses} empty="Hasn't joined a course yet." />
                    <Section
                      title="Applications sent"
                      items={selected.applications}
                      empty="Hasn't applied to a job or internship yet."
                    />
                    <Section
                      title="Certificates issued"
                      items={selected.certificates}
                      empty="No certificates issued to this person yet."
                      mono
                    />
                  </TabsContent>

                  <TabsContent value="referrals" className="pt-4">
                    {selected.referralActivity.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nobody has signed up through this person's code yet.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Who signed up</TableHead>
                            <TableHead>Shared on</TableHead>
                            <TableHead>They joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selected.referralActivity.map((a, i) => (
                            <TableRow key={i}>
                              <TableCell>{a.joinedName}</TableCell>
                              <TableCell>{a.sharedOn}</TableCell>
                              <TableCell>{a.joinedOn}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      selected.active
                        ? setDeactivating(selected)
                        : toggleActive.mutate({ id: selected.id, active: true })
                    }
                  >
                    {selected.active ? "Deactivate this person" : "Reactivate this person"}
                  </Button>
                  <Button variant="outline" onClick={() => setRegenerating(selected)}>
                    Replace referral code
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(o) => !o && setDeactivating(null)}
        title={`Deactivate ${deactivating?.name ?? ""}?`}
        consequence={`They will lose access to their Enginow account and stop appearing in course lists. Their ${deactivating?.referralsMade ?? 0} referrals and past certificates stay on record, and you can reactivate them at any time.`}
        confirmLabel="Deactivate this person"
        cancelLabel="Keep them active"
        variant="destructive"
        typeToConfirm={deactivating?.name ?? ""}
        onConfirm={() => {
          if (deactivating) toggleActive.mutate({ id: deactivating.id, active: false });
          setDeactivating(null);
        }}
      />

      <ConfirmDialog
        open={!!regenerating}
        onOpenChange={(o) => !o && setRegenerating(null)}
        title="Replace this referral code?"
        consequence={`Every link ${regenerating?.name ?? ""} has already shared with the old code will stop working immediately. Anyone who used it before still counts.`}
        confirmLabel="Replace the code"
        cancelLabel="Keep the current code"
        variant="destructive"
        typeToConfirm={regenerating?.referralCode ?? ""}
        onConfirm={() => {
          if (regenerating) regenerate.mutate(regenerating.id);
          setRegenerating(null);
        }}
      />
    </div>
  );
}

function Section({
  title,
  items,
  empty,
  mono,
}: {
  title: string;
  items: string[];
  empty: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((i) => (
            <li key={i} className={mono ? "font-mono text-xs" : undefined}>
              {i}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
