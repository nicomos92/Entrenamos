"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { AppointmentForm } from "@/app/trainer/agenda/AppointmentForm";

interface AppointmentView {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string;
  duration_minutes: number;
}

interface StudentAppointmentsProps {
  appointments: AppointmentView[];
  studentId: string;
}

function formatTimeRange(scheduledAt: string, durationMinutes: number) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${fmt(start)} - ${fmt(end)}`;
}

export function StudentAppointments({ appointments, studentId }: StudentAppointmentsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editAppt = editingId ? appointments.find((a) => a.id === editingId) : null;

  const editData = editAppt
    ? {
        id: editAppt.id,
        studentId,
        diaSemana: String(new Date(editAppt.scheduled_at).getDay()),
        time: new Date(editAppt.scheduled_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
        durationMinutes: editAppt.duration_minutes ?? 60,
        notes: editAppt.notes,
      }
    : null;

  const future = appointments.filter((a) => new Date(a.scheduled_at) >= new Date());
  const past = appointments.filter((a) => new Date(a.scheduled_at) < new Date()).slice(0, 3);

  return (
    <div className="space-y-3">
      {future.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">Próximos</p>
          {future.map((appt) => (
            <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={appt.id}>
              <div>
                <p className="font-bold">
                  {new Date(appt.scheduled_at).toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </p>
                <p className="text-text-muted">{formatTimeRange(appt.scheduled_at, appt.duration_minutes ?? 60)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${appt.status === "cancelado" ? "bg-status-urgent/10 text-status-urgent" : "bg-primary/10 text-primary"}`}>
                  {appt.status}
                </span>
                <button
                  className="text-text-muted transition hover:text-primary"
                  onClick={() => setEditingId(appt.id)}
                  title="Editar turno"
                  type="button"
                >
                  <Pencil size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">Últimos pasados</p>
          {past.map((appt) => (
            <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={appt.id}>
              <span className="font-bold">
                {new Date(appt.scheduled_at).toLocaleDateString("es-AR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${appt.status === "cancelado" ? "bg-status-urgent/10 text-status-urgent" : "bg-primary/10 text-primary"}`}>
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {!showForm && !editingId && (
        <button
          className="ghost-button w-full text-sm"
          onClick={() => setShowForm(true)}
          type="button"
        >
          <Plus size={14} strokeWidth={2.5} />
          {appointments.length === 0 ? "Agendar primer turno" : "Agendar otro turno"}
        </button>
      )}

      {(showForm || editingId) && (
        <div className="mt-3">
          <AppointmentForm
            editData={editData}
            onCancelEdit={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            studentOptions={[{ id: studentId, name: "" }]}
          />
        </div>
      )}
    </div>
  );
}
