import { CheckCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CheckInSuccess({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-success/20">
          <CheckCheck size={40} strokeWidth={2.5} className="text-success" />
        </div>
        <p className="text-2xl font-black text-text-primary">
          {message ?? "Check-in exitoso"}
        </p>
        <p className="mt-2 text-text-muted">
          {message ?? "Tu presencia fue registrada. ¡Seguí así!"}
        </p>
        <Link
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-secondary"
          href="/student"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
