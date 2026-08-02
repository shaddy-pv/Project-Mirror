import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  sub,
  deltaPct,
  deltaLabel,
}: {
  label: string;
  value: string;
  sub?: string;
  deltaPct?: number | null;
  deltaLabel?: string;
}) {
  const up = (deltaPct ?? 0) >= 0;
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="px-5 py-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground" title={value}>
          {value}
        </p>
        {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
        {deltaPct != null ? (
          <p
            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
              up ? "text-primary" : "text-destructive"
            }`}
          >
            {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {up ? "+" : ""}
            {deltaPct}% vs {deltaLabel}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
