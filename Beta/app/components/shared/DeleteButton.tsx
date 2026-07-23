"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({ action, confirmMessage }: { action: () => Promise<void>; confirmMessage: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-full bg-status-urgent/10 px-3 py-1.5 text-xs font-bold text-status-urgent transition hover:bg-status-urgent/20 disabled:opacity-50"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(() => {
            action();
          });
        }
      }}
      type="button"
    >
      <Trash2 size={13} strokeWidth={2.25} />
      Eliminar
    </button>
  );
}
