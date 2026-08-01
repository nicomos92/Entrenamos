"use client";

import { useTransition } from "react";
import { Copy, Pause } from "lucide-react";
import { duplicateRoutine, setRoutineDraft } from "@/app/trainer/routines/actions";

export function DuplicateButton({ routineId }: { routineId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-secondary/20 disabled:opacity-50"
      disabled={isPending}
      onClick={() => startTransition(() => duplicateRoutine(routineId))}
      type="button"
    >
      <Copy size={13} strokeWidth={2.25} />
      Duplicar
    </button>
  );
}

export function PausarButton({ routineId }: { routineId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-full bg-text-muted/10 px-3 py-1.5 text-xs font-bold text-text-muted transition hover:bg-text-muted/20 disabled:opacity-50"
      disabled={isPending}
      onClick={() => startTransition(() => setRoutineDraft(routineId))}
      type="button"
    >
      <Pause size={13} strokeWidth={2.25} />
      Pausar
    </button>
  );
}
