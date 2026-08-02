import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canAccess, useSession, type ModuleKey } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/types";

/** Blocks a page when the signed-in role isn't allowed to open it. */
export function RoleGuard({
  module,
  children,
}: {
  module: ModuleKey;
  children: React.ReactNode;
}) {
  const role = useSession((s) => s.role);
  if (canAccess(role, module)) return <>{children}</>;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
      <div className="rounded-full bg-neutral-soft p-3">
        <ShieldAlert className="h-5 w-5 text-muted-foreground" />
      </div>
      <h1 className="text-lg font-semibold">This page isn't part of your work</h1>
      <p className="text-sm text-muted-foreground">
        Your account is set up as {ROLE_LABELS[role]}, and this page belongs to another team. Ask an
        Admin if you think you should have access.
      </p>
      <Button asChild>
        <Link to="/">Go to your dashboard</Link>
      </Button>
    </div>
  );
}
