import { cn } from "../../utils/cn";

type FormPreviewProps = {
  error?: boolean;
  label: string;
  multiline?: boolean;
  value: string;
};

export function FormPreview({ error, label, multiline, value }: FormPreviewProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
        {label}
      </label>
      <div
        className={cn(
          "flex min-h-12 w-full items-start rounded-lg border bg-white px-3.5 py-3 text-base leading-6 text-slate-900",
          multiline && "min-h-[104px]",
          error && "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]",
          !error && "border-[#e5e7eb]",
        )}
      >
        {value}
      </div>
    </div>
  );
}
