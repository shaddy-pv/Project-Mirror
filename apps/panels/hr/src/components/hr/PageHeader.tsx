import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function HelpDrawer({ title, lines }: { title: string; lines: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label={`What is this page for? — ${title}`}
        onClick={() => setOpen(true)}
      >
        <HelpCircle />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>About this page</SheetTitle>
            <SheetDescription>{title}</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 text-sm text-foreground/80">
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function PageHeader({
  title,
  subtitle,
  help,
  actions,
}: {
  title: string;
  subtitle?: string;
  help: string[];
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-background/80 px-6 py-5 backdrop-blur">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <HelpDrawer title={title} lines={help} />
      </div>
    </div>
  );
}
