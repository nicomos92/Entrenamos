"use client";

import { CalendarPlus } from "lucide-react";
import { createAppointment } from "@/app/trainer/agenda/actions";

interface AppointmentFormProps {
  studentOptions: { id: string; name: string }[];
}

export function AppointmentForm({ studentOptions }: AppointmentFormProps) {
  const handleSubmit = (formData: FormData) => {
    // Agregar timezone offset del cliente
    formData.append("timezone_offset_minutes", new Date().getTimezoneOffset().toString());
    createAppointment(formData);
  };

  return (
    <article className="glass-card rounded-3xl p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
        <CalendarPlus size={14} strokeWidth={2.5} />
        Nuevo turno
      </p>
      {studentOptions.length === 0 ? (
        <p className="text-text-muted">Necesitás al menos un alumno cargado para agendar un turno.</p>
      ) : (
        <form action={handleSubmit} className="space-y-3">
          <select className="field-input" defaultValue="" name="student_id" required>
            <option disabled value="">
              Elegí un alumno
            </option>
            {studentOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input className="field-input" name="date" required type="date" />
            <input className="field-input" name="time" required type="time" />
          </div>
          <input className="field-input" name="notes" placeholder="Notas (opcional)" type="text" />
          <button className="secondary-button w-full" type="submit">
            Agendar turno
          </button>
        </form>
      )}
    </article>
  );
}
