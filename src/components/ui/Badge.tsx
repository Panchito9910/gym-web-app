import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "accent" | "ok" | "danger" | "outline";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  default: "bg-[var(--paper-3)] text-[var(--fg)]",
  accent: "bg-[var(--accent)] text-[var(--paper)]",
  ok: "bg-[var(--ok)]/15 text-[var(--ok)] border border-[var(--ok)]/30",
  danger: "bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30",
  outline: "border border-[var(--border)] text-[var(--fg-muted)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-xs)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
