import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  helpText?: string;
  id: string;
  label: string;
};

export function FormField({ error, helpText, id, label, required, className = "", ...props }: FormFieldProps) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-xs">
      <label className="text-label-bold text-on-surface" htmlFor={id}>
        {label}
        {required ? <span className="sr-only"> wajib</span> : null}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        className={[
          "min-h-11 rounded border bg-surface-container-lowest px-md text-body-md text-on-surface shadow-control",
          "placeholder:text-on-surface-variant",
          "focus:border-secondary focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary",
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
