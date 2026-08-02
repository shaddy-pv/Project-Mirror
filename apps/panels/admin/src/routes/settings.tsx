import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/panel/PageHeader";
import { RoleGuard } from "@/components/panel/RoleGuard";
import { useSession } from "@/lib/session";
import { ROLE_LABELS, type Role } from "@/lib/types";
const staff = [
  { id: "1", name: "Alice Admin", email: "alice@enginow.com", role: "admin" },
  { id: "2", name: "Bob Educator", email: "bob@enginow.com", role: "educator" },
  { id: "3", name: "Charlie HR", email: "charlie@enginow.com", role: "hr" },
  { id: "4", name: "Diana Sales", email: "diana@enginow.com", role: "sales" },
];

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Enginow Panel" },
      { name: "description", content: "Update your profile, password and (for Admins) the team." },
      { property: "og:title", content: "Settings — Enginow Panel" },
      {
        property: "og:description",
        content: "Update your profile, password and (for Admins) the team.",
      },
    ],
  }),
  component: () => (
    <RoleGuard module="settings">
      <SettingsPage />
    </RoleGuard>
  ),
});

function SettingsPage() {
  const { role, name, email } = useSession();
  const [profileName, setProfileName] = useState(name);
  const [profileEmail, setProfileEmail] = useState(email);
  const [password, setPassword] = useState("");
  const [team, setTeam] = useState(staff);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Your account details, and — if you're an Admin — who else works in this panel."
        helpTitle="Settings"
        helpLines={[
          "Change your own name, email and password here. Nothing you change on this page is visible to learners.",
          "Admins can also change what each teammate is allowed to see, using the Team list at the bottom.",
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pname">Your name</Label>
            <Input id="pname" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pemail">Your work email</Label>
            <Input
              id="pemail"
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={() => toast.success("Profile saved")}>Save my profile</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change your password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-1.5">
            <Label htmlFor="pw">New password</Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            {password.length > 0 && password.length < 8 && (
              <p className="text-sm text-danger">
                That's too short — use at least 8 characters so your account stays safe.
              </p>
            )}
          </div>
          <Button
            disabled={password.length < 8}
            onClick={() => {
              setPassword("");
              toast.success("Password changed");
            }}
          >
            Change my password
          </Button>
        </CardContent>
      </Card>

      {role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team & what they can see</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Work email</TableHead>
                  <TableHead className="w-48">Their role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(v) => {
                          setTeam((prev) =>
                            prev.map((m) => (m.id === member.id ? { ...m, role: v as Role } : m)),
                          );
                          toast.success(`${member.name} is now ${ROLE_LABELS[v as Role]}`);
                        }}
                      >
                        <SelectTrigger aria-label={`Role for ${member.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
