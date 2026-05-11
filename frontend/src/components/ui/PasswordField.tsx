import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  compact?: boolean;
  error?: string;
  helpText?: string;
  id: string;
  label: string;
  leadingIcon?: ReactNode;
};

export function PasswordField({ compact = false, error, helpText, id, label, leadingIcon, required, className = "", ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const Icon = visible ? EyeOff : Eye;
  const inputDensity = compact ? "min-h-10 py-xs text-[15px]" : "min-h-11 py-sm text-body-md";
  const iconPadding = "pl-xl";
  const labelClass = compact ? "text-[13px] font-bold leading-4 text-on-surface" : "text-label-bold text-on-surface";
  const toggleSize = compact ? "h-8 w-8" : "h-9 w-9";

  return (
    <div className={compact ? "grid gap-[3px]" : "grid gap-xs"}>
      <label className={labelClass} htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className="relative">
        {leadingIcon ? <span className="pointer-events-none absolute left-md top-1/2 flex -translate-y-1/2 text-on-surface-variant">{leadingIcon}</span> : null}
        <input
          className={[
            "w-full rounded border bg-surface-container-low px-md pr-xl text-on-surface",
            inputDensity,
            leadingIcon ? iconPadding : "",
            "focus:border-secondary focus:bg-surface-container-lowest focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary",
            "disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant",
            error ? "border-error" : "border-outline-variant",
            className,
          ].join(" ")}
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : undefined}
          id={id}
          required={required}
          type={visible ? "text" : "password"}
          {...props}
        />
        <button
          aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className={["absolute right-xs top-1/2 flex -translate-y-1/2 items-center justify-center rounded text-primary-container transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary", toggleSize].join(" ")}
          disabled={props.disabled}
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          <Icon aria-hidden="true" size={18} />
        </button>
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
