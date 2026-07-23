import Link from "next/link";
import { Dumbbell, Plus, Pencil } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getExercises } from "@/lib/data/trainer";
import { DeleteButton } from "@/app/components/shared/DeleteButton";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { deleteExercise } from "@/app/trainer/exercises/actions";

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
        icon={Dumbbell}
        title="Ejercicios"
      />

      {exercises.length === 0 ? (
        <EmptyState
          description="Sumá el primero para poder armar rutinas."
          icon={Dumbbell}
          title="Todavía no cargaste ejercicios"
        />
      ) : (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
          {exercises.map((exercise) => (
            <article className="glass-card rounded-3xl p-4" key={exercise.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{exercise.name}</p>
                  <p className="text-sm text-text-muted">
                    {exercise.focus || "Sin foco"} · {exercise.default_sets} x{" "}
                    {exercise.default_reps ?? exercise.default_time ?? "-"} · descanso {exercise.default_rest}s
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    className="inline-flex items-center gap-1 rounded-full bg-white/50 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-white/70"
                    href={`/trainer/exercises/${exercise.id}`}
                  >
                    <Pencil size={12} strokeWidth={2.5} />
                    Editar
                  </Link>
                  <DeleteButton action={deleteExercise.bind(null, exercise.id)} confirmMessage={`¿Eliminar "${exercise.name}"?`} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
