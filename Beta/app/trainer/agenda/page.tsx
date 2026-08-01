import { CalendarDays } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getWeeklySchedule } from "@/lib/data/trainer";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { WeeklyCalendar } from "@/app/trainer/agenda/WeeklyCalendar";

export default async function TrainerAgendaPage() {
  const { supabase, user } = await requireProfile("trainer");
  const [schedule, { data: students }] = await Promise.all([
    getWeeklySchedule(supabase, user.id),
    supabase.from("students").select("profile_id, profiles(full_name)").eq("trainer_id", user.id),
  ]);

  const studentOptions = (students ?? []).map((s) => ({
    id: s.profile_id,
    name: (s.profiles as unknown as { full_name: string } | null)?.full_name ?? "Alumno",
  }));

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Horarios semanales con tus alumnos"
        icon={<CalendarDays size={20} strokeWidth={2.25} />}
        title="Agenda semanal"
      />

      <WeeklyCalendar entries={schedule} studentOptions={studentOptions} />
    </section>
  );
}
