import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

import { useSession, type Role } from "@/lib/store";

/** Restricts this whole route tree to a single role. HR sees nothing else. */
export function RoleGuard({ allow, children }: { allow: Role; children: ReactNode }) {
  const role = useSession((s) => s.role);

  if (role !== allow) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto size-6 text-danger" />
          <h1 className="mt-3 text-lg font-semibold">This panel is for HR staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account doesn't have access to hiring pages. Ask an Admin if you think this is a
            mistake.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
