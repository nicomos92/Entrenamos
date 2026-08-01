import { CalendarDays, CalendarX } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { DIAS_SEMANA } from "@/lib/supabase/database.types";

export default async function StudentAgendaPage() {
  const { supabase, user } = await requireProfile("student");

  const { data: schedules } = await supabase
    .from("student_schedules")
    .select("id, dia_semana, hora")
    .eq("student_id", user.id)
    .order("dia_semana", { ascending: true })
    .order("hora", { ascending: true });

  const { data: student } = await supabase
    .from("students")
    .select("trainer_id")
    .eq("profile_id", user.id)
    .single();

  const trainerName = student?.trainer_id
    ? (await supabase.from("profiles").select("full_name").eq("id", student.trainer_id).single()).data?.full_name
    : null;

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Tus horarios con el entrenador"
        icon={<CalendarDays size={20} strokeWidth={2.25} />}
        title="Agenda semanal"
      />

      {!schedules || schedules.length === 0 ? (
        <EmptyState
          description="Tu entrenador te va a cargar los horarios pronto."
          icon={<CalendarX size={26} strokeWidth={2.25} />}
          title="Todavía no tenés horarios"
        />
      ) : (
        <>
          <p className="text-sm text-text-muted">
            Estos son tus turnos fijos de la semana con{" "}
            <span className="font-bold text-primary">{trainerName ?? "tu entrenador"}</span>. Cada uno dura 60 minutos.
          </p>
          <div className="space-y-3">
            {schedules.map((sched) => (
              <article className="glass-card rounded-3xl p-4" key={sched.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{DIAS_SEMANA[sched.dia_semana]}</p>
                    <p className="text-sm text-text-muted">Sesión de 60 minutos</p>
                  </div>
                  <span className="rounded-full bg-secondary/15 px-4 py-1.5 text-sm font-bold text-secondary">
                    {sched.hora.slice(0, 5)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
