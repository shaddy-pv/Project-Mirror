import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/sales/AppShell";
import { HelpDrawer } from "@/components/sales/HelpDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProfile, saveProfile, type SalesProfile } from "@/lib/sales-api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Your Settings — Enginow Sales" },
      { name: "description", content: "Update your Enginow sales account details, password and email notifications." },
      { property: "og:title", content: "Your Settings — Enginow Sales" },
      { property: "og:description", content: "Update your Enginow sales account details and notifications." },
    ],
  }),
  component: SettingsPage,
});

const HELP = [
  { title: "This page is just yours", body: "Changes here only affect your own account — nobody else's." },
  { title: "Notifications", body: "Turn on an email whenever a new sales enquiry arrives, plus an optional weekly summary." },
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isPending } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const [form, setForm] = useState<SalesProfile | null>(null);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (next: Partial<SalesProfile>) => saveProfile(next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Your details have been saved");
    },
  });

  return (
    <AppShell
      title="Settings"
      subtitle="Your own account details"
      actions={<HelpDrawer title="About this page" intro="What you can change here." items={HELP} />}
    >
      {isPending || !form ? (
        <Skeleton className="h-96 max-w-2xl rounded-xl" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Your details</CardTitle>
              <CardDescription>Name and contact details shown to your team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
                Save details
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Change password</CardTitle>
              <CardDescription>Use at least 8 characters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="cur">Current password</Label>
                <Input id="cur" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conf">Confirm new password</Label>
                <Input id="conf" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  if (pw.next.length < 8) {
                    toast.error("Your new password needs at least 8 characters");
                    return;
                  }
                  if (pw.next !== pw.confirm) {
                    toast.error("The two new passwords don't match");
                    return;
                  }
                  setPw({ current: "", next: "", confirm: "" });
                  toast.success("Password updated");
                }}
              >
                Update password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Email notifications</CardTitle>
              <CardDescription>Choose when Enginow emails you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "notifyNewInquiry" as const, label: "A new sales enquiry arrives" },
                { key: "notifyWeeklySummary" as const, label: "Weekly summary of enrollments" },
                { key: "notifyBigJumps" as const, label: "A course suddenly gets a lot of sign-ups" },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4">
                  <Label htmlFor={row.key} className="font-normal">
                    {row.label}
                  </Label>
                  <Switch
                    id={row.key}
                    checked={form[row.key]}
                    onCheckedChange={(checked) => {
                      const next = { ...form, [row.key]: checked };
                      setForm(next);
                      mutation.mutate({ [row.key]: checked });
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
