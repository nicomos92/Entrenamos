import { Status } from "@/app/types";

export function StatusBadge({ status }: { status: Status }) {
  const isActive = status === "activo";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        isActive ? "bg-primary/10 text-primary" : "bg-text-muted/10 text-text-muted"
      }`}
    >
      <span className={`size-1.5 rounded-full ${isActive ? "bg-primary" : "bg-text-muted"}`} />
      {status}
    </span>
  );
}
