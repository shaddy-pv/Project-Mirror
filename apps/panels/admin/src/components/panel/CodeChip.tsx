import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Monospace chip for referral codes and credential IDs, with copy-to-clipboard. */
export function CodeChip({
  code,
  label = "Code",
  className,
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — select the code and copy it manually.");
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-neutral-soft px-2 py-1 font-mono text-xs tracking-wider text-foreground",
        className,
      )}
    >
      {code}
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label.toLowerCase()} ${code}`}
        className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}
