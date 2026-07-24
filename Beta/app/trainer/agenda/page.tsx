import { CalendarDays, History } from "lucide-react";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getAppointments } from "@/lib/data/trainer";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { AppointmentFormWrapper } from "@/app/trainer/agenda/AppointmentFormWrapper";
import { AgendaCalendar } from "@/app/trainer/agenda/AgendaCalendar";
import { AgendaListClient } from "@/app/trainer/agenda/AgendaListClient";

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
      <SectionHeader eyebrow="Turnos con tus alumnos" icon={<CalendarDays size={20} strokeWidth={2.25} />} title="Agenda" />

      <Link className="ghost-button w-fit text-sm" href="/trainer/agenda/history">
        <History size={14} strokeWidth={2.5} />
        Ver historial
      </Link>

      <AppointmentFormWrapper studentOptions={studentOptions} />

      <AgendaCalendar appointments={appointments} />

      <AgendaListClient appointments={appointments} studentOptions={studentOptions} />
    </section>
  );
}
