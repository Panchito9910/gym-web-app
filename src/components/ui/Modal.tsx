import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] p-0 text-[var(--fg)] backdrop:bg-black/40",
        sizes[size],
      )}
    >
      <div className="flex items-start justify-between gap-4 px-5 py-4 hairline-b">
        <div>
          <h2 className="font-display text-base font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-steel">{description}</p>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
          <X size={16} />
        </Button>
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer ? (
        <div className="flex items-center justify-end gap-2 px-5 py-4 hairline-t">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
