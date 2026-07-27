"use client";

import { useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { resetDatabase } from "@/app/admin/actions";

export function ResetDatabaseButton() {
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ error?: string; ok?: boolean } | null>(null);

  const handleReset = async () => {
    setPending(true);
    setResult(null);
    const res = await resetDatabase(confirm);
    setResult(res);
    if (res.ok) setConfirm("");
    setPending(false);
  };

  return (
    <article className="rounded-3xl border-2 border-status-urgent/20 bg-status-urgent/5 p-5">
      <p className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-status-urgent">
        <AlertTriangle size={14} strokeWidth={2.5} />
        Zona peligrosa
      </p>
      <p className="mb-4 text-sm text-text-muted">
        Esto eliminará <strong>todos</strong> los entrenadores, alumnos, rutinas, ejercicios, turnos, sesiones y notificaciones.
        Solo quedará tu cuenta de administrador. Esta acción no se puede deshacer.
      </p>

      <div className="flex items-center gap-3">
        <input
          className="field-input flex-1 rounded-2xl py-2 text-center text-sm uppercase tracking-[0.15em]"
          placeholder="Escribí RESET"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          className="inline-flex items-center gap-2 rounded-2xl bg-status-urgent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-status-urgent/80 disabled:opacity-40"
          disabled={confirm !== "RESET" || pending}
          onClick={handleReset}
          type="button"
        >
          {pending ? <RotateCcw size={16} className="animate-spin" strokeWidth={2.5} /> : <RotateCcw size={16} strokeWidth={2.5} />}
          {pending ? "Eliminando..." : "Resetear DB"}
        </button>
      </div>

      {result?.ok && (
        <p className="mt-3 rounded-2xl bg-status-active/10 px-4 py-3 text-sm font-bold text-status-active">
          Base de datos reseteada. Solo queda tu cuenta de admin.
        </p>
      )}
      {result?.error && (
        <p className="mt-3 rounded-2xl bg-status-urgent/10 px-4 py-3 text-sm font-bold text-status-urgent">
          {result.error}
        </p>
      )}
    </article>
  );
}
