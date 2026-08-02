import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ApprovalBar({
  itemName,
  onApprove,
  onReject,
  size = "default",
}: {
  itemName: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
  size?: "default" | "sm";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div className="flex items-center gap-2">
      <Button size={size} onClick={onApprove}>
        <Check className="h-4 w-4" />
        Approve
      </Button>
      <Button size={size} variant="outline" onClick={() => setOpen(true)}>
        <X className="h-4 w-4" />
        Send back
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send "{itemName}" back to the author</DialogTitle>
            <DialogDescription>
              The author will see exactly what you write here, so say what needs to change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">What needs to change?</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Needs a clearer excerpt before this can go live."
            />
            {reason.trim().length === 0 && (
              <p className="text-xs text-muted-foreground">
                Write a short reason — this is required so the author knows what to fix.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={reason.trim().length === 0}
              onClick={() => {
                onReject(reason.trim());
                setReason("");
                setOpen(false);
              }}
            >
              Send back with this reason
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
