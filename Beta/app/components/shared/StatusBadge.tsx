import { Status } from "@/app/types";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "activo" ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-[#3E4850]/10 text-text-muted"}`}>
      {status}
    </span>
  );
}
