import type { ReactNode } from "react";
import { IconBadge } from "@/app/components/shared/IconBadge";

export function SectionHeader({
  icon,
  eyebrow,
  title,
  action,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <IconBadge icon={icon} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">{eyebrow}</p>
          <h1 className="text-3xl font-bold text-text-primary lg:text-4xl">{title}</h1>
        </div>
      </div>
      {action}
    </div>
  );
}
