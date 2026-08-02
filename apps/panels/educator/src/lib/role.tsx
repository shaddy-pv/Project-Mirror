import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

export type Role = "admin" | "educator" | "hr" | "sales";

/** Mock session — in the real panel this comes from the shared login. */
export const session: { role: Role } = { role: "educator" };

export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  if (!allow.includes(session.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto size-8 text-muted-foreground" />
          <h1 className="mt-3 text-lg font-semibold">This area isn't part of your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Educator accounts can only open their own courses, blogs and resources.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
