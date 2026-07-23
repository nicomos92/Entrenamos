import Link from "next/link";
import { ListX } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getActiveAssignment } from "@/lib/data/student";
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
          icon={ListX}
          title="Sin rutina para entrenar"
        />
      </section>
    );
  }

  return <WorkoutClient assignment={assignment} />;
}
