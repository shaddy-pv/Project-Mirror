import type { ReactNode } from "react";
import { HelpDrawer } from "./HelpDrawer";

export function PageHeader({
  title,
  subtitle,
  helpTitle,
  helpLines,
  actions,
}: {
  title: string;
  subtitle: string;
  helpTitle: string;
  helpLines: string[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <HelpDrawer title={helpTitle} lines={helpLines} />
        {actions}
      </div>
    </div>
  );
}
