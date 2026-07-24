"use client";

import { useState, useMemo } from "react";
import { Search, CalendarX, Pencil, Repeat, Trash2, QrCode } from "lucide-react";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { DeleteButton } from "@/app/components/shared/DeleteButton";
import { AppointmentStatusSelect } from "@/app/trainer/agenda/AppointmentStatusSelect";
import { AppointmentFormWrapper } from "@/app/trainer/agenda/AppointmentFormWrapper";
import { deleteAppointment, deleteRecurringSeries } from "@/app/trainer/agenda/actions";
import { CheckInButton } from "@/app/trainer/agenda/CheckInButton";
import { QRCodeModal } from "@/app/trainer/agenda/QRCodeModal";

interface AppointmentView {
  id: string;
  student_id: string;
  studentName: string;
  scheduled_at: string;
  status: string;
  notes: string;
  duration_minutes: number;
  recurring_group_id: string | null;
  recurring_rule: string | null;
}

interface AgendaListClientProps {
  appointments: AppointmentView[];
  studentOptions: { id: string; name: string }[];
}

type TimeFilter = "future" | "past" | "all";

function formatTimeRange(scheduledAt: string, durationMinutes: number) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${fmt(start)} - ${fmt(end)}`;
}

export function AgendaListClient({ appointments, studentOptions }: AgendaListClientProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("future");
  const [studentFilter, setStudentFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [qrAppointment, setQrAppointment] = useState<AppointmentView | null>(null);

  const filtered = useMemo(() => {
    const now = new Date();
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.scheduled_at);

      if (timeFilter === "future" && apptDate < now) return false;
      if (timeFilter === "past" && apptDate >= now) return false;

      if (studentFilter && appt.student_id !== studentFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = appt.studentName.toLowerCase().includes(q) || appt.notes?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [appointments, timeFilter, studentFilter, searchQuery]);

  const hasRecurring = (appt: AppointmentView) => appt.recurring_group_id && appt.recurring_rule;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["future", "past", "all"] as const).map((opt) => (
          <button
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
              timeFilter === opt
                ? "bg-secondary text-white shadow-glow"
                : "bg-white/50 text-text-muted hover:bg-white/70"
            }`}
            key={opt}
            onClick={() => setTimeFilter(opt)}
            type="button"
          >
            {opt === "future" ? "Próximos" : opt === "past" ? "Pasados" : "Todos"}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Buscar</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            className="field-input rounded-2xl py-2.5 pl-9 text-sm"
            placeholder="Buscar por alumno o nota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>

        <select
          className="field-input w-44 rounded-2xl py-2.5 text-sm"
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
        >
          <option value="">Todos los alumnos</option>
          {studentOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm font-bold text-text-muted">
        {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            description={appointments.length === 0 ? "Agendá el primero desde el formulario de arriba." : "No hay turnos para esos filtros."}
            icon={<CalendarX size={26} strokeWidth={2.25} />}
            title={appointments.length === 0 ? "No hay turnos agendados" : "Sin resultados"}
          />
        ) : (
          filtered.map((appt) => (
            <article className="glass-card rounded-3xl p-4" key={appt.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{appt.studentName}</p>
                    {hasRecurring(appt) && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <Repeat size={10} strokeWidth={2.5} />
                        {appt.recurring_rule === "weekly" ? "Semanal" : "Bisemanal"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted">
                    {new Date(appt.scheduled_at).toLocaleDateString("es-AR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                    {" · "}
                    {formatTimeRange(appt.scheduled_at, appt.duration_minutes ?? 60)}
                  </p>
                  {appt.notes && <p className="mt-1 text-sm text-text-muted">{appt.notes}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {(appt.status === "pendiente" || appt.status === "confirmado") && (
                    <CheckInButton appointmentId={appt.id} />
                  )}
                  <AppointmentStatusSelect id={appt.id} status={appt.status as any} />
                  <div className="flex gap-1">
                    <AppointmentFormWrapper
                      editData={{
                        id: appt.id,
                        studentId: appt.student_id,
                        scheduledAt: appt.scheduled_at,
                        durationMinutes: appt.duration_minutes ?? 60,
                        notes: appt.notes,
                        recurringRule: appt.recurring_rule,
                      }}
                      renderTrigger={(onEdit) => (
                        <button
                          className="inline-flex items-center gap-1 rounded-full bg-white/50 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-white/70"
                          onClick={onEdit}
                          type="button"
                        >
                          <Pencil size={12} strokeWidth={2.5} />
                          Editar
                        </button>
                      )}
                      studentOptions={studentOptions}
                    />
                    <button
                      className="inline-flex items-center gap-1 rounded-full bg-white/50 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-white/70"
                      onClick={() => setQrAppointment(appt)}
                      type="button"
                    >
                      <QrCode size={12} strokeWidth={2.5} />
                      QR
                    </button>
                    {appt.recurring_group_id ? (
                      <DeleteButton
                        action={deleteRecurringSeries.bind(null, appt.recurring_group_id)}
                        confirmMessage="¿Eliminar toda la serie recurrente?"
                      />
                    ) : (
                      <DeleteButton action={deleteAppointment.bind(null, appt.id)} confirmMessage="¿Eliminar este turno?" />
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {qrAppointment && (
        <QRCodeModal
          appointmentId={qrAppointment.id}
          studentName={qrAppointment.studentName}
          scheduledAt={qrAppointment.scheduled_at}
          onClose={() => setQrAppointment(null)}
        />
      )}
    </div>
  );
}
