import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, STAGES, type Stage } from "@/lib/api";
import { cn } from "@/lib/utils";

const stageTone: Record<Stage, string> = {
  Applied: "text-muted-foreground",
  Shortlisted: "text-pending",
  OA: "text-pending",
  Selected: "text-brand font-medium",
};

export function StageDropdown({
  applicantId,
  stage,
  kind = "job",
  className,
}: {
  applicantId: string;
  stage: Stage;
  kind?: "job" | "internship";
  className?: string;
}) {
  const queryClient = useQueryClient();

  const move = useMutation({
    mutationFn: (next: Stage) => api.moveApplicant(applicantId, next, kind),
    onSuccess: (_data, next) => {
      queryClient.invalidateQueries({ queryKey: ["hr", "applicants"] });
      queryClient.invalidateQueries({ queryKey: ["hr", "dashboard"] });
      toast.success(`Moved to ${next}`);
    },
    onError: () => toast.error("Couldn't move this applicant. Please try again."),
  });

  return (
    <Select
      value={stage}
      disabled={move.isPending}
      onValueChange={(value) => move.mutate(value as Stage)}
    >
      <SelectTrigger
        className={cn("h-8 w-[150px] bg-card text-sm", stageTone[stage], className)}
        aria-label="Move applicant to another stage"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            {s === stage ? s : `Move to ${s}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
