import { useToastStore } from "./use-toast";

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto w-full max-w-sm rounded-[var(--radius-sm)] border px-4 py-3 text-left text-sm shadow-sm transition-all ${
            t.kind === "success"
              ? "border-[var(--ok)]/40 bg-[var(--paper)] text-[var(--fg)]"
              : t.kind === "error"
                ? "border-[var(--danger)]/50 bg-[var(--paper)] text-[var(--danger)]"
                : "border-[var(--border)] bg-[var(--paper)] text-[var(--fg)]"
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
