import { type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "super" | "secondary" | "warning" | "danger" | "disabled";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border-[#0f9d58] bg-[#0f9d58] text-white hover:bg-[#0b7340]",
  super: "border-[#6366f1] bg-[#6366f1] text-white hover:bg-[#4f46e5]",
  secondary: "border-[#e5e7eb] bg-white text-[#111827] hover:bg-slate-50",
  warning: "border-[#fde68a] bg-[#fffbeb] text-[#92400e] hover:bg-[#fef3c7]",
  danger: "border-[#fecaca] bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca]",
  disabled:
    "border-[#e5e7eb] bg-white text-[#9ca3af] opacity-75 hover:bg-white disabled:cursor-not-allowed",
};

export function Button({
  className,
  disabled,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-bold leading-5 shadow-none transition focus:outline-none focus:ring-2 focus:ring-[#0f9d58] focus:ring-offset-2 disabled:pointer-events-none max-md:w-full",
        variants[variant],
        className,
      )}
      disabled={disabled || variant === "disabled"}
      type={type}
      {...props}
    />
  );
}
