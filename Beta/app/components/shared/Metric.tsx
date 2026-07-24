import type { ReactNode } from "react";
import { IconBadge } from "@/app/components/shared/IconBadge";

export function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="glass-card rounded-3xl p-4">
      <IconBadge icon={icon} size="sm" />
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}
