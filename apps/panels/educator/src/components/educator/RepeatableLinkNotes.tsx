import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VideoLink } from "@/lib/mock/types";
import { uid } from "@/lib/api";

export function RepeatableLinkNotes({
  value,
  onChange,
}: {
  value: VideoLink[];
  onChange: (v: VideoLink[]) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>YouTube videos</Label>
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">No videos added yet. Add your first video below.</p>
      )}
      {value.map((row, i) => (
        <div key={row.id} className="space-y-2 rounded-lg border border-border bg-secondary/30 p-3">
          <div className="flex items-center gap-2">
            <Input
              value={row.url}
              placeholder="https://youtube.com/watch?v=…"
              onChange={(e) =>
                onChange(value.map((r) => (r.id === row.id ? { ...r, url: e.target.value } : r)))
              }
              className="bg-card"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove video ${i + 1}`}
              onClick={() => onChange(value.filter((r) => r.id !== row.id))}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
          <Textarea
            value={row.notes}
            placeholder="Notes for this video — what learners should watch for"
            onChange={(e) => onChange(value.map((r) => (r.id === row.id ? { ...r, notes: e.target.value } : r)))}
            className="bg-card"
            rows={2}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...value, { id: uid(), url: "", notes: "" }])}
      >
        <Plus className="mr-1 size-4" /> Add another video
      </Button>
    </div>
  );
}
