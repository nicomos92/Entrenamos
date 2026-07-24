import { CalendarDays, CalendarX, XCircle } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { CancelAppointmentButton } from "@/app/student/agenda/CancelAppointmentButton";

function formatTimeRange(scheduledAt: string, durationMinutes: number) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${fmt(start)} - ${fmt(end)}`;
}

export default async function StudentAgendaPage() {
  const { supabase, user } = await requireProfile("student");

  const now = new Date().toISOString();

  const [futureAppts, pastAppts] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, notes, duration_minutes, trainer_id, profiles!trainer_id(full_name)")
      .eq("student_id", user.id)
      .gte("scheduled_at", now)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, notes, duration_minutes, trainer_id, profiles!trainer_id(full_name)")
      .eq("student_id", user.id)
      .lt("scheduled_at", now)
      .order("scheduled_at", { ascending: false })
      .limit(20),
  ]);

  const future = futureAppts.data ?? [];
  const past = pastAppts.data ?? [];

  return (
    <section className="space-y-6">
      <SectionHeader eyebrow="Tus turnos con el entrenador" icon={<CalendarDays size={20} strokeWidth={2.25} />} title="Agenda" />

      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-text-muted">Próximos</p>
        {future.length === 0 ? (
          <EmptyState
            description="Tu entrenador te va a agendar un turno pronto."
            icon={<CalendarX size={26} strokeWidth={2.25} />}
            title="No tenés turnos agendados"
          />
        ) : (
          <div className="space-y-3">
            {future.map((appt) => {
              const trainerName = (appt.profiles as unknown as { full_name: string } | null)?.full_name ?? "Entrenador";
              return (
                <article className="glass-card rounded-3xl p-4" key={appt.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {new Date(appt.scheduled_at).toLocaleDateString("es-AR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                        })}
                      </p>
                      <p className="text-sm text-text-muted">
                        {formatTimeRange(appt.scheduled_at, appt.duration_minutes ?? 60)}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">Con {trainerName}</p>
                      {appt.notes && <p className="mt-1 text-sm text-text-muted">{appt.notes}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        appt.status === "confirmado"
                          ? "bg-status-active/10 text-status-active"
                          : appt.status === "pendiente"
                          ? "bg-status-attention/10 text-status-attention"
                          : "bg-text-muted/10 text-text-muted"
                      }`}>
                        {appt.status}
                      </span>
                      {appt.status !== "cancelado" && appt.status !== "completado" && (
                        <CancelAppointmentButton appointmentId={appt.id} />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-text-muted">Anteriores</p>
          <div className="space-y-3">
            {past.map((appt) => (
              <article className="glass-card rounded-3xl p-4" key={appt.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">
                      {new Date(appt.scheduled_at).toLocaleDateString("es-AR", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-text-muted">
                      {formatTimeRange(appt.scheduled_at, appt.duration_minutes ?? 60)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    appt.status === "completado"
                      ? "bg-status-active/10 text-status-active"
                      : appt.status === "cancelado"
                      ? "bg-status-urgent/10 text-status-urgent"
                      : "bg-text-muted/10 text-text-muted"
                  }`}>
                    {appt.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
