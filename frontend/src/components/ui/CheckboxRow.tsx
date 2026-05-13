type CheckboxRowProps = {
  description: string;
  label: string;
};

export function CheckboxRow({ description, label }: CheckboxRowProps) {
  return (
    <label className="flex min-h-[74px] items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-3.5 max-md:items-start max-md:px-4 max-md:py-4">
      <input
        aria-label={label}
        className="sr-only"
        readOnly
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded border-2 border-[#0f9d58] bg-[#e8f5e9]"
      />
      <span className="min-w-0">
        <span className="block text-base font-bold leading-5 text-slate-900">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span>
      </span>
    </label>
  );
}
