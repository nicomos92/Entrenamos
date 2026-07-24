import type { ReactNode } from "react";
import { IconBadge } from "@/app/components/shared/IconBadge";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
      <IconBadge icon={icon} size="lg" />
      <div>
        <p className="font-bold text-text-primary">{title}</p>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
