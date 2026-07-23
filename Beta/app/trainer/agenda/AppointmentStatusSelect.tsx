"use client";

import { useTransition } from "react";
import { updateAppointmentStatus } from "@/app/trainer/agenda/actions";
import type { AppointmentStatus } from "@/lib/supabase/database.types";

const OPTIONS: AppointmentStatus[] = ["pendiente", "confirmado", "cancelado", "completado"];

export function AppointmentStatusSelect({ id, status }: { id: string; status: AppointmentStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="rounded-full border border-white/50 bg-white/50 px-3 py-1 text-xs font-bold text-primary outline-none"
      defaultValue={status}
      disabled={isPending}
      onChange={(event) =>
        startTransition(() => {
          updateAppointmentStatus(id, event.target.value as AppointmentStatus);
        })
      }
    >
      {OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
