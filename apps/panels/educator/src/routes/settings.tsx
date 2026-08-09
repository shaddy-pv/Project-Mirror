import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/educator/AppShell";
import { RoleGuard, useSession } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Enginow Educator" },
      { name: "description", content: "Update your Enginow educator profile, password and notification preferences." },
      { property: "og:title", content: "Settings — Enginow Educator" },
      { property: "og:description", content: "Your own profile and notification settings." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["educator"]}>
      <SettingsPage />
    </RoleGuard>
  ),
});

function SettingsPage() {
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => api.getProfile() });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);

  const { updateProfile } = useSession();

  useEffect(() => {
    if (profile.data) {
      setName(profile.data.name || "");
      setEmail(profile.data.email || "");
    }
  }, [profile.data]);

  const saveProfile = useMutation({
    mutationFn: () => api.saveProfile({ name: name.trim(), email: email.trim() }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      updateProfile(data.name, data.email);
      toast.success("Profile saved");
    },
  });

  const savePrefs = useMutation({
    mutationFn: (patch: Record<string, boolean>) => api.saveProfile(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Notification preferences saved");
    },
  });

  const changePassword = () => {
    if (current.length < 6) return setPwError("Enter your current password.");
    if (next.length < 8) return setPwError("Your new password needs at least 8 characters.");
    if (next !== confirm) return setPwError("The two new passwords don't match.");
    setPwError(null);
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Password changed");
  };

  const p = profile.data;

  return (
    <AppShell
      title="Settings"
      description="Your own account. Nothing here affects other educators or the site."
      help={{
        title: "Settings",
        lines: [
          "This page only covers your own profile, password and email notifications.",
          "Course approvals and site-wide settings are handled by Admin.",
        ],
      }}
    >
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button disabled={saveProfile.isPending} onClick={() => saveProfile.mutate()}>
              Save profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pw-current">Current password</Label>
              <Input id="pw-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-next">New password</Label>
              <Input id="pw-next" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-confirm">Repeat new password</Label>
              <Input id="pw-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            <Button onClick={changePassword}>Change password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email me when…</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "notifyApprovals", label: "Admin approves or sends back one of my submissions" },
              { key: "notifyEnrollments", label: "A learner enrolls in one of my courses" },
              { key: "notifyWeeklySummary", label: "My weekly summary of enrollments is ready" },
            ].map((row) => (
              <label key={row.key} className="flex items-center justify-between gap-4 text-sm">
                <span>{row.label}</span>
                <Switch
                  checked={Boolean(p?.[row.key as "notifyApprovals"])}
                  onCheckedChange={(v) => savePrefs.mutate({ [row.key]: v })}
                />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
