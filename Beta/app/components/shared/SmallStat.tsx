import type { LucideIcon } from "lucide-react";

export function SmallStat({ label, value, icon: Icon }: { label: string; value: string; icon?: LucideIcon }) {
  return (
    <div className="rounded-2xl bg-white/30 px-2 py-3">
      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
        {Icon && <Icon size={11} strokeWidth={2.5} />}
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-primary">{value}</p>
    </div>
  );
}
