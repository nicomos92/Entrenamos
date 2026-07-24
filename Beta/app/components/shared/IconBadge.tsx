import type { ReactNode } from "react";

const SIZES = {
  sm: "size-9",
  md: "size-11",
  lg: "size-14",
} as const;

const TONES = {
  soft: "bg-soft text-primary",
  white: "bg-white/60 text-primary",
  urgent: "bg-status-urgent/10 text-status-urgent",
  attention: "bg-status-attention/10 text-status-attention",
} as const;

export function IconBadge({
  icon,
  size = "md",
  tone = "soft",
}: {
  icon: ReactNode;
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className={`grid ${SIZES[size]} shrink-0 place-items-center rounded-2xl ${TONES[tone]}`}>
      {icon}
    </div>
  );
}
