import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  compact?: boolean;
  error?: string;
  helpText?: string;
  id: string;
  label: string;
  leadingIcon?: ReactNode;
};

export function FormField({ compact = false, error, helpText, id, label, leadingIcon, required, className = "", ...props }: FormFieldProps) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const inputDensity = compact ? "min-h-10 text-[15px]" : "min-h-11 text-body-md";
  const iconPadding = "pl-xl";
  const labelClass = compact ? "text-[13px] font-bold leading-4 text-on-surface" : "text-label-bold text-on-surface";

  return (
    <div className={compact ? "grid gap-[3px]" : "grid gap-xs"}>
      <label className={labelClass} htmlFor={id}>
        {label}
        {required ? <span className="sr-only"> wajib</span> : null}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className="relative">
        {leadingIcon ? <span className="pointer-events-none absolute left-md top-1/2 flex -translate-y-1/2 text-on-surface-variant">{leadingIcon}</span> : null}
        <input
          className={[
            "w-full rounded border bg-surface-container-low px-md text-on-surface",
            inputDensity,
            leadingIcon ? iconPadding : "",
            "placeholder:text-on-surface-variant",
            "focus:border-secondary focus:bg-surface-container-lowest focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary",
            "disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant",
            error ? "border-error" : "border-outline-variant",
            className,
          ].join(" ")}
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : undefined}
          id={id}
          required={required}
          {...props}
        />
      </div>
      {helpText ? (
        <p className="min-h-4 text-label-sm text-on-surface-variant" id={helpId}>
          {helpText}
        </p>
      ) : null}
      {error ? (
        <p className="min-h-4 text-label-sm font-medium text-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
