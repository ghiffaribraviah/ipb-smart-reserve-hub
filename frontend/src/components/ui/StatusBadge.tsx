import { cn } from "../../utils/cn";

type BadgeTone = "success" | "warning" | "danger" | "neutral";

type StatusBadgeProps = {
  label: string;
  tone: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  success: "bg-[#d1fae5] text-[#065f46]",
  warning: "bg-[#fef3c7] text-[#92400e]",
  danger: "bg-[#fee2e2] text-[#991b1b]",
  neutral: "bg-[#f3f4f6] text-[#4b5563]",
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full px-2.5 py-1.5 text-xs font-bold leading-4 max-md:w-full",
        tones[tone],
      )}
    >
      <span className="min-w-0 whitespace-normal break-words">{label}</span>
    </span>
  );
}
