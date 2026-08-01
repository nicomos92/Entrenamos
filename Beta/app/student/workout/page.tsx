import Link from "next/link";
import { ListX, Clock } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getActiveAssignment } from "@/lib/data/student";
import { isRoutineUsable, getTodayDayNumber } from "@/lib/utils/routine";
import { WorkoutClient } from "@/app/student/workout/WorkoutClient";
import { EmptyState } from "@/app/components/shared/EmptyState";

export default async function StudentWorkoutPage() {
  const { supabase, user } = await requireProfile("student");
  const assignment = await getActiveAssignment(supabase, user.id);

  if (!assignment || assignment.exercises.length === 0) {
    return (
      <section className="space-y-5">
        <EmptyState
          action={
            <Link className="premium-button w-full" href="/student">
              Volver al inicio
            </Link>
          }
          description={
            assignment
              ? "Tu rutina asignada todavía no tiene ejercicios cargados."
              : "Tu entrenador todavía no te asignó una rutina."
          }
          icon={<ListX size={26} strokeWidth={2.25} />}
          title="Sin rutina para entrenar"
        />
      </section>
    );
  }

  if (!isRoutineUsable(assignment)) {
    return (
      <section className="space-y-5">
        <EmptyState
          action={
            <Link className="premium-button w-full" href="/student">
              Volver al inicio
            </Link>
          }
          description="Tu rutina asignada no está dentro de su período de uso. Consultá a tu entrenador para saber cuándo arrancás."
          icon={<Clock size={26} strokeWidth={2.25} />}
          title="Rutina no disponible"
        />
      </section>
    );
  }

  const todayDay = getTodayDayNumber(assignment.startWeekday, assignment.days);

  return <WorkoutClient assignment={assignment} todayDay={todayDay} />;
}
