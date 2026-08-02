import { useState } from "react";
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
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={`What is this page for? ${title}`}
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>Here's what this page is for and how to use it.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 text-sm leading-relaxed text-foreground">
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
