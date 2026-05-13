import type { InputHTMLAttributes, ReactNode } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  icon: ReactNode;
  label: string;
};

export function AuthField({ error, icon, id, label, ...props }: AuthFieldProps) {
  return (
    <div className="mb-6 max-md:mb-[18px]">
      <label className="mb-2 block text-sm font-semibold text-[#2D3748]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 flex -translate-y-1/2 text-[#718096]">
          {icon}
        </span>
        <input
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-[43px] w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-10 pr-4 text-sm text-[#2D3748] outline-none transition focus:border-[#0A9361] focus:bg-white focus:ring-2 focus:ring-[#0A9361]/10 max-md:h-12"
          id={id}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs font-semibold text-[#991b1b]" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
