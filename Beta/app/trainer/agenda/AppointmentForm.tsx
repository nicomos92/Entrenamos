"use client";

import { useActionState } from "react";
import { CalendarPlus, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { createAppointment, updateAppointment } from "@/app/trainer/agenda/actions";
import type { FormState } from "@/lib/types/form";

interface AppointmentFormProps {
  studentOptions: { id: string; name: string }[];
  editData?: {
    id: string;
    studentId: string;
    date: string;
    time: string;
    notes: string;
    durationMinutes: number;
  } | null;
  onCancelEdit?: () => void;
}

const initialState: FormState = { error: null };

export function AppointmentForm({ studentOptions, editData, onCancelEdit }: AppointmentFormProps) {
  const isEditing = !!editData;

  const wrappedAction = async (_prev: FormState, formData: FormData): Promise<FormState> => {
    formData.append("timezone_offset_minutes", new Date().getTimezoneOffset().toString());
    if (isEditing && editData) {
      formData.append("appointment_id", editData.id);
      return updateAppointment(_prev, formData);
    }
    return createAppointment(_prev, formData);
  };

  const [state, formAction, pending] = useActionState(wrappedAction, initialState);

  return (
    <article className="glass-card rounded-3xl p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
        <CalendarPlus size={14} strokeWidth={2.5} />
        {isEditing ? "Editar turno" : "Nuevo turno"}
      </p>
      {studentOptions.length === 0 && !isEditing ? (
        <p className="text-text-muted">Necesitás al menos un alumno cargado para agendar un turno.</p>
      ) : (
        <form action={formAction} className="space-y-3">
          <select className="field-input" defaultValue={editData?.studentId ?? ""} name="student_id" required>
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
            <input className="field-input" defaultValue={editData?.date ?? ""} name="date" required type="date" />
            <input className="field-input" defaultValue={editData?.time ?? ""} name="time" required type="time" />
          </div>
          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
              <Clock size={13} strokeWidth={2.5} />
              Duración
            </span>
            <select className="field-input" defaultValue={editData?.durationMinutes ?? 60} name="duration_minutes">
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hora</option>
              <option value={75}>1h 15m</option>
              <option value={90}>1h 30m</option>
              <option value={120}>2 horas</option>
            </select>
          </label>
          <input className="field-input" defaultValue={editData?.notes ?? ""} name="notes" placeholder="Notas (opcional)" type="text" />

          {state.error && (
            <p className="flex items-center gap-2 rounded-2xl bg-status-urgent/10 px-4 py-3 text-sm font-bold text-status-urgent">
              <AlertCircle size={16} strokeWidth={2.5} className="shrink-0" />
              {state.error}
            </p>
          )}
          {state.success && state.message && (
            <p className="flex items-center gap-2 rounded-2xl bg-status-active/10 px-4 py-3 text-sm font-bold text-status-active">
              <CheckCircle2 size={16} strokeWidth={2.5} className="shrink-0" />
              {state.message}
            </p>
          )}

          <div className="flex gap-2">
            <button className="secondary-button flex-1" disabled={pending} type="submit">
              {pending ? "Guardando..." : isEditing ? "Guardar cambios" : "Agendar turno"}
            </button>
            {isEditing && onCancelEdit && (
              <button className="ghost-button" onClick={onCancelEdit} type="button">
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </article>
  );
}
