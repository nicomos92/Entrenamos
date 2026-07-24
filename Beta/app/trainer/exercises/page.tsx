import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getExercises } from "@/lib/data/trainer";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { ExercisesList } from "@/app/trainer/exercises/ExercisesList";

export default async function TrainerExercisesPage() {
  const { supabase, user } = await requireProfile("trainer");
  const exercises = await getExercises(supabase, user.id);

  return (
    <section className="space-y-5">
      <SectionHeader
        action={
          <Link className="premium-button whitespace-nowrap px-4 py-3 text-sm" href="/trainer/exercises/new">
            <Plus size={16} strokeWidth={2.5} />
            Ejercicio
          </Link>
        }
        eyebrow="Biblioteca del entrenador"
        icon={<Dumbbell size={20} strokeWidth={2.25} />}
        title="Ejercicios"
      />

      <ExercisesList exercises={exercises} />
    </section>
  );
}
