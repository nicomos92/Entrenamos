"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-5 backdrop-blur-sm"
      onClick={() => {
        if (!pending) onCancel();
      }}
      role="dialog"
    >
      <div
        className="animate-scale w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-lift ring-1 ring-white/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid size-12 place-items-center rounded-2xl bg-status-urgent/10 text-status-urgent">
          <TriangleAlert size={22} strokeWidth={2.25} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            className="ghost-button flex-1 rounded-2xl border border-white/50 bg-white/40"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-status-urgent px-5 py-2.5 font-bold text-white shadow-glow transition-all duration-150 hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}