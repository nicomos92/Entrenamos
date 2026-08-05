"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/app/components/shared/ConfirmModal";

export function DeleteButton({ action, confirmMessage }: { action: () => Promise<void>; confirmMessage: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        className="inline-flex items-center gap-1.5 rounded-full bg-status-urgent/10 px-3 py-1.5 text-xs font-bold text-status-urgent transition hover:bg-status-urgent/20 disabled:opacity-50"
        disabled={isPending}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Trash2 size={13} strokeWidth={2.25} />
        Eliminar
      </button>
      <ConfirmModal
        confirmLabel="Eliminar"
        message={confirmMessage}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          startTransition(() => {
            action();
          });
          setOpen(false);
        }}
        open={open}
        pending={isPending}
        title="¿Estás seguro?"
      />
    </>
  );
}