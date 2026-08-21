import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface FieldWrapProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrap({ id, label, error, hint, required, children }: FieldWrapProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-steel">
        {label}
        {required ? <span className="text-[var(--accent)]"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-steel">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, required, id, className, ...props },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <FieldWrap id={inputId} label={label} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 w-full rounded-[var(--radius-sm)] border bg-[var(--paper-2)] px-3 text-sm",
          "border-[var(--border)] placeholder:text-[var(--steel-soft)]",
          "focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]",
          "disabled:opacity-50",
          error && "border-[var(--danger)] focus-visible:ring-[var(--danger)]",
          className,
        )}
        {...props}
      />
    </FieldWrap>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, required, id, className, rows = 3, ...props },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <FieldWrap id={inputId} label={label} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-[var(--radius-sm)] border bg-[var(--paper-2)] px-3 py-2 text-sm",
          "border-[var(--border)] placeholder:text-[var(--steel-soft)]",
          "focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]",
          "disabled:opacity-50",
          error && "border-[var(--danger)] focus-visible:ring-[var(--danger)]",
          className,
        )}
        {...props}
      />
    </FieldWrap>
  );
});

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, required, options, id, className, ...props },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <FieldWrap id={inputId} label={label} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 w-full rounded-[var(--radius-sm)] border bg-[var(--paper-2)] px-3 text-sm",
          "border-[var(--border)]",
          "focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]",
          "disabled:opacity-50",
          error && "border-[var(--danger)] focus-visible:ring-[var(--danger)]",
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
});
