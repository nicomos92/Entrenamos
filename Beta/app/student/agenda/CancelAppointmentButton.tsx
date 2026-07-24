"use client";

import { useTransition } from "react";
import { XCircle } from "lucide-react";
import { cancelStudentAppointment } from "@/app/student/agenda/actions";

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm("¿Cancelar este turno?")) return;
    startTransition(() => {
      cancelStudentAppointment(appointmentId);
    });
  };

  return (
    <button
      className="inline-flex items-center gap-1 rounded-full bg-status-urgent/10 px-3 py-1.5 text-xs font-bold text-status-urgent transition hover:bg-status-urgent/20"
      disabled={isPending}
      onClick={handleCancel}
      type="button"
    >
      <XCircle size={12} strokeWidth={2.5} />
      {isPending ? "Cancelando..." : "Cancelar"}
    </button>
  );
}
