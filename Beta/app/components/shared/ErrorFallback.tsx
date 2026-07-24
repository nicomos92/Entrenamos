"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export function ErrorFallback({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-status-urgent/10">
        <AlertTriangle size={28} className="text-status-urgent" strokeWidth={2} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-text-primary">Algo salió mal</h2>
        <p className="mt-2 text-sm text-text-muted">{error.message || "Ocurrió un error inesperado. Intentá de nuevo."}</p>
      </div>
      <button className="premium-button" onClick={reset} type="button">
        <RotateCcw size={16} strokeWidth={2.5} />
        Reintentar
      </button>
    </div>
  );
}
