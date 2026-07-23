import type { LucideIcon } from "lucide-react";

const SIZES = {
  sm: { box: "size-9", icon: 16 },
  md: { box: "size-11", icon: 20 },
  lg: { box: "size-14", icon: 26 },
} as const;

const TONES = {
  soft: "bg-soft text-primary",
  white: "bg-white/60 text-primary",
  urgent: "bg-status-urgent/10 text-status-urgent",
  attention: "bg-status-attention/10 text-status-attention",
} as const;

export function IconBadge({
  icon: Icon,
  size = "md",
  tone = "soft",
}: {
  icon: LucideIcon;
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
}) {
  const { box, icon } = SIZES[size];
  return (
    <div className={`grid ${box} shrink-0 place-items-center rounded-2xl ${TONES[tone]}`}>
      <Icon size={icon} strokeWidth={2.25} />
    </div>
  );
}
