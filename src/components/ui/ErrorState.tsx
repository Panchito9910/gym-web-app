import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
}

export function ErrorState({
  title = "Algo falló",
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-5 py-4">
      <p className="font-display text-sm font-semibold text-[var(--danger)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--fg)]">{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
