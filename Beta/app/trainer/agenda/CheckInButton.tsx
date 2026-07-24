"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { updateAppointmentStatus } from "@/app/trainer/agenda/actions";

export function CheckInButton({ appointmentId, disabled }: { appointmentId: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] transition ${
        disabled
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : "bg-success/20 text-success shadow-soft hover:bg-success/30"
      }`}
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          await updateAppointmentStatus(appointmentId, "completado");
        })
      }
      type="button"
    >
      <CheckCheck size={14} strokeWidth={2.5} />
      {pending ? "..." : "Check-in"}
    </button>
  );
}
