import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Module } from "@/lib/mock/types";
import { uid } from "@/lib/api";

/** Ordered curriculum / roadmap builder. */
export function ModuleBuilder({ value, onChange }: { value: Module[]; onChange: (v: Module[]) => void }) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <Label>Roadmap — what learners work through, in order</Label>
      {value.length === 0 && <p className="text-sm text-muted-foreground">No modules yet. Add your first module.</p>}
      {value.map((m, i) => (
        <div key={m.id} className="flex items-center gap-2">
          <span className="w-6 text-sm text-muted-foreground">{i + 1}.</span>
          <Input
            value={m.title}
            placeholder="Module title"
            onChange={(e) => onChange(value.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x)))}
            className="bg-card"
          />
          <Button type="button" variant="ghost" size="icon" aria-label="Move up" onClick={() => move(i, -1)}>
            <ArrowUp className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Move down" onClick={() => move(i, 1)}>
            <ArrowDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove module"
            onClick={() => onChange(value.filter((x) => x.id !== m.id))}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...value, { id: uid(), title: "" }])}>
        <Plus className="mr-1 size-4" /> Add another module
      </Button>
    </div>
  );
}
