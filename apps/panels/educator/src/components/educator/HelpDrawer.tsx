import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function HelpDrawer({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Help for this page" className="text-muted-foreground">
          <HelpCircle className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[360px] sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Plain-language help for this page.</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 px-4 text-sm text-muted-foreground">
          {lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
