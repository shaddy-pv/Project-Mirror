import type { ComponentType, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { LucideProps } from "lucide-react";

export function EmptyState({
  icon: Icon,
  line,
  actionLabel,
  onAction,
  children,
}: {
  icon: ComponentType<LucideProps>;
  line: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon className="size-5" />
      </span>
      <p className="max-w-md text-sm text-muted-foreground">{line}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
      {children}
    </div>
  );
}
