import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  iconOnly?: boolean;
  isLoading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-secondary text-secondary-on hover:bg-secondary-on-container",
  secondary: "bg-surface-container text-primary-container hover:bg-surface-container-high",
  outline: "border border-primary-container bg-transparent text-primary-container hover:bg-primary-fixed",
  destructive: "bg-error text-error-on hover:bg-error-on-container",
  ghost: "bg-transparent text-primary-container hover:bg-surface-container-high",
  link: "min-h-0 bg-transparent px-0 text-secondary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-md text-label-bold",
  md: "min-h-11 px-lg text-label-bold",
  lg: "min-h-12 px-lg text-body-md font-bold",
};

export function Button({
  children,
  className = "",
  disabled,
  iconOnly = false,
  isLoading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const shapeClass = iconOnly ? "h-11 w-11 p-0" : sizeClasses[size];
  const contentClass = isLoading ? "opacity-0" : "";

  return (
    <button
      className={[
        "relative inline-flex shrink-0 items-center justify-center gap-sm rounded font-sans transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        shapeClass,
        className,
      ].join(" ")}
      aria-busy={isLoading || undefined}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="absolute h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      <span className={["inline-flex items-center justify-center gap-sm", contentClass].join(" ")}>
        {children}
      </span>
    </button>
  );
}
