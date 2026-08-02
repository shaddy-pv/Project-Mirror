import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSalesUi } from "@/store/sales-ui";
import type { RangePreset } from "@/lib/sales-api";

const PRESETS: Array<{ value: RangePreset; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

export function DateRangeSelector() {
  const { preset, from, to, setPreset, setCustom } = useSalesUi();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
      <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
        <SelectTrigger className="w-[170px] bg-card" aria-label="Choose a time period">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === "custom" ? (
        <div className="flex items-center gap-2">
          <Label htmlFor="from" className="sr-only">
            Start date
          </Label>
          <Input
            id="from"
            type="date"
            className="w-[150px] bg-card"
            value={from ?? ""}
            onChange={(e) => setCustom(e.target.value, to ?? e.target.value)}
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Label htmlFor="to" className="sr-only">
            End date
          </Label>
          <Input
            id="to"
            type="date"
            className="w-[150px] bg-card"
            value={to ?? ""}
            onChange={(e) => setCustom(from ?? e.target.value, e.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
