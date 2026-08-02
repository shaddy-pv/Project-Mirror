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

export type HelpItem = { title: string; body: string };

export function HelpDrawer({ title, intro, items }: { title: string; intro: string; items: HelpItem[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="What do these numbers mean?"
          className="rounded-full"
        >
          <HelpCircle className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{intro}</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-8">
          {items.map((item) => (
            <div key={item.title}>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
