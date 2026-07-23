import { CalendarDays, CalendarX } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getAppointments } from "@/lib/data/trainer";
import { DeleteButton } from "@/app/components/shared/DeleteButton";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { AppointmentStatusSelect } from "@/app/trainer/agenda/AppointmentStatusSelect";
import { AppointmentForm } from "@/app/trainer/agenda/AppointmentForm";
import { deleteAppointment } from "@/app/trainer/agenda/actions";

export default async function TrainerAgendaPage() {
  const { supabase, user } = await requireProfile("trainer");
  const [appointments, { data: students }] = await Promise.all([
    getAppointments(supabase, user.id),
    supabase.from("students").select("profile_id, profiles(full_name)").eq("trainer_id", user.id),
  ]);

  const studentOptions = (students ?? []).map((s) => ({
    id: s.profile_id,
    name: (s.profiles as unknown as { full_name: string } | null)?.full_name ?? "Alumno",
  }));

  return (
    <section className="space-y-5">
      <SectionHeader eyebrow="Turnos con tus alumnos" icon={CalendarDays} title="Agenda" />

      <AppointmentForm studentOptions={studentOptions} />

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <EmptyState description="Agendá el primero desde el formulario de arriba." icon={CalendarX} title="No hay turnos agendados" />
        ) : (
          appointments.map((appt) => (
            <article className="glass-card rounded-3xl p-4" key={appt.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{appt.studentName}</p>
                  <p className="text-sm text-text-muted">
                    {new Date(appt.scheduled_at).toLocaleString("es-AR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {appt.notes && <p className="mt-1 text-sm text-text-muted">{appt.notes}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <AppointmentStatusSelect id={appt.id} status={appt.status} />
                  <DeleteButton action={deleteAppointment.bind(null, appt.id)} confirmMessage="¿Eliminar este turno?" />
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
