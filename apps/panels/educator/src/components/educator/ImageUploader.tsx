import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** Enforces a 1920x1080 (16:9) banner and explains failures in plain words. */
export function ImageUploader({
  label = "Banner image",
  value,
  onChange,
  optional = false,
}: {
  label?: string | undefined;
  value?: string | undefined;
  onChange: (dataUrl?: string) => void;
  optional?: boolean | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image — upload a JPG or PNG banner.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const target = 16 / 9;
        if (ratio < target - 0.08) {
          setError(
            `This image is too narrow — upload a 1920×1080 banner. Yours is ${img.width}×${img.height}.`,
          );
          return;
        }
        if (ratio > target + 0.08) {
          setError(
            `This image is too wide — upload a 1920×1080 banner. Yours is ${img.width}×${img.height}.`,
          );
          return;
        }
        onChange(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} <span className="font-normal text-muted-foreground">— 1920×1080{optional ? ", optional" : ""}</span>
      </Label>

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-border">
          <img src={value} alt="Banner preview" className="aspect-video w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-primary-foreground/40" />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => {
              onChange(undefined);
              setError(null);
            }}
          >
            <X className="mr-1 size-3.5" /> Remove banner
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/40 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent"
        >
          <ImagePlus className="size-6" />
          <span>Drag a banner here, or click to choose a file</span>
          <span className="text-xs">The visible area is the full 16:9 frame shown here</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
