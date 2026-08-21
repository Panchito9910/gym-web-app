import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-steel">{icon}</div> : null}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-steel">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
