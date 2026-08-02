import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/hr/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api, qk } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "My Settings — Enginow HR" },
      {
        name: "description",
        content: "Update your name and email, change your password and choose which alerts you get.",
      },
      { property: "og:title", content: "My Settings — Enginow HR" },
      { property: "og:description", content: "Update your profile, password and notifications." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({ queryKey: qk.profile, queryFn: api.profile });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: () => api.updateProfile({ name, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.profile });
      toast.success("Profile saved");
    },
    onError: () => toast.error("Couldn't save your profile. Please try again."),
  });

  const savePassword = useMutation({
    mutationFn: () => api.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed");
    },
    onError: () =>
      toast.error("Check your current password and use at least 8 characters for the new one."),
  });

  const toggleNotification = useMutation({
    mutationFn: (patch: Record<string, boolean>) => api.updateProfile(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.profile });
      toast.success("Notification preference saved");
    },
    onError: () => toast.error("Couldn't save that preference. Please try again."),
  });

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Your own account. Nothing here affects anyone else."
        help={[
          "Change your name, email or password, and pick which emails you want to receive.",
          "Team members and site content are managed by Admin.",
        ]}
      />

      <div className="max-w-2xl space-y-6 px-6 py-6">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold">My profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button className="mt-4" disabled={saveProfile.isPending} onClick={() => saveProfile.mutate()}>
            Save profile
          </Button>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold">Change password</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
          </div>
          <Button
            className="mt-4"
            disabled={savePassword.isPending || !currentPassword || !newPassword}
            onClick={() => savePassword.mutate()}
          >
            Change password
          </Button>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold">Email me when…</h2>
          <div className="mt-4 space-y-3">
            {[
              { key: "notifyNewApplicant", label: "Someone applies to one of my listings" },
              { key: "notifyApproval", label: "Admin approves or rejects something I sent" },
              { key: "notifyInquiry", label: "A new career inquiry arrives" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <Switch
                  id={item.key}
                  checked={Boolean(profile?.[item.key as keyof typeof profile])}
                  onCheckedChange={(checked) => toggleNotification.mutate({ [item.key]: checked })}
                />
                <Label htmlFor={item.key} className="text-sm font-normal">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
