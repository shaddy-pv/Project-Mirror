import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface LinkNote {
  url: string;
  notes: string;
}

export function RepeatableLinkNotes({
  items,
  onChange,
}: {
  items: LinkNote[];
  onChange: (items: LinkNote[]) => void;
}) {
  function update(index: number, patch: Partial<LinkNote>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium">Video lessons</span>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No videos added yet. Add a YouTube link and a short note about what it covers.
        </p>
      )}
      {items.map((item, i) => (
        <div key={i} className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor={`video-url-${i}`}>YouTube link</Label>
            <Input
              id={`video-url-${i}`}
              value={item.url}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`video-notes-${i}`}>What this video covers</Label>
            <Input
              id={`video-notes-${i}`}
              value={item.notes}
              onChange={(e) => update(i, { notes: e.target.value })}
              placeholder="Introduction and setup"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Remove video ${i + 1}`}
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, { url: "", notes: "" }])}
      >
        <Plus className="h-4 w-4" />
        Add another video
      </Button>
    </div>
  );
}
