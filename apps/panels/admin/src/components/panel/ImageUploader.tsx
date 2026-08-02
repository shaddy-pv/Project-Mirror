import { useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_MB = 5;
const TARGET_RATIO = 1920 / 1080;

export function ImageUploader({
  value,
  onChange,
  label = "Banner image",
}: {
  value?: string | undefined;
  onChange: (url: string | undefined) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image — upload a JPG or PNG.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`This image is too large — upload something under ${MAX_MB}MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      if (Math.abs(ratio - TARGET_RATIO) > 0.06) {
        setError(
          `This image is ${img.width}×${img.height}. Banners need to be a wide 16:9 shape like 1920×1080 — crop it and try again.`,
        );
        URL.revokeObjectURL(url);
        return;
      }
      onChange(url);
    };
    img.onerror = () => setError("We couldn't read that image — try a different file.");
    img.src = url;
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {value ? (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg border bg-neutral-soft">
            <img src={value} alt="Banner preview" className="aspect-video w-full object-cover" />
          </div>
          <Button variant="outline" size="sm" onClick={() => onChange(undefined)}>
            <Trash2 className="h-4 w-4" />
            Remove image
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-card p-6 text-center"
        >
          <ImageUp className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop a wide 1920×1080 image here, or choose a file. Max {MAX_MB}MB.
          </p>
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Choose image
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
