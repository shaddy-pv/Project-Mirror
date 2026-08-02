import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useEffect } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, title, subtitle, children, width = "520px" }: DrawerProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(21,23,28,0.35)", backdropFilter: "blur(2px)" }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full flex-col overflow-hidden"
            style={{
              width,
              maxWidth: "100vw",
              background: "#fff",
              borderLeft: "0.8px solid rgba(21,23,28,0.10)",
              boxShadow: "-20px 0 60px rgba(21,23,28,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: "0.8px solid rgba(21,23,28,0.08)" }}>
              <div>
                <h2 className="text-[17px] font-bold" style={{ fontFamily: "Archivo Variable", color: "var(--ink)" }}>{title}</h2>
                {subtitle && <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--ink-mute)" }}>{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors"
                style={{ background: "var(--secondary)" }}
              >
                <X className="h-4 w-4" style={{ color: "var(--ink)" }} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
