import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ListChecks, PlusCircle } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getExercises } from "@/lib/data/trainer";
import { DeleteButton } from "@/app/components/shared/DeleteButton";
import { addExerciseToRoutine, deleteRoutine, removeExerciseFromRoutine } from "@/app/trainer/routines/actions";

export default async function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireProfile("trainer");

  const { data: routine } = await supabase
    .from("routines")
    .select("id, name, goal, estimated_minutes")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single();

  if (!routine) notFound();

  const [{ data: routineExercises }, exercises] = await Promise.all([
    supabase
      .from("routine_exercises")
      .select("id, sets, reps, time, rest, order_index, exercises(id, name)")
      .eq("routine_id", id)
      .order("order_index", { ascending: true }),
    getExercises(supabase, user.id),
  ]);

  const boundAdd = addExerciseToRoutine.bind(null, id);
  const boundDelete = deleteRoutine.bind(null, id);

  return (
    <section className="space-y-5">
      <div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary" href="/trainer/routines">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Rutinas
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-text-muted">{routine.goal || "Sin objetivo"}</p>
            <h1 className="text-3xl font-bold text-primary">{routine.name}</h1>
            <p className="text-text-muted">{routine.estimated_minutes} min estimados</p>
          </div>
          <DeleteButton action={boundDelete} confirmMessage={`¿Eliminar la rutina "${routine.name}"? Esto no se puede deshacer.`} />
        </div>
      </div>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <ListChecks size={14} strokeWidth={2.5} />
          Ejercicios
        </p>
        {!routineExercises || routineExercises.length === 0 ? (
          <p className="text-text-muted">Todavía no agregaste ejercicios.</p>
        ) : (
          <div className="space-y-2">
            {routineExercises.map((re) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={re.id}>
                <div>
                  <p className="font-bold">{(re.exercises as unknown as { name: string } | null)?.name}</p>
                  <p className="text-text-muted">
                    {re.sets} x {re.reps ?? re.time ?? "-"} · descanso {re.rest}s
                  </p>
                </div>
                <DeleteButton action={removeExerciseFromRoutine.bind(null, id, re.id)} confirmMessage="¿Quitar este ejercicio de la rutina?" />
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <PlusCircle size={14} strokeWidth={2.5} />
          Agregar ejercicio
        </p>
        {exercises.length === 0 ? (
          <p className="text-text-muted">
            No tenés ejercicios cargados.{" "}
            <Link className="font-bold text-primary" href="/trainer/exercises/new">
              Creá uno
            </Link>
            .
          </p>
        ) : (
          <form action={boundAdd} className="space-y-3">
            <select className="field-input" defaultValue="" name="exercise_id" required>
              <option disabled value="">
                Elegí un ejercicio
              </option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input className="field-input" name="sets" placeholder="Series" type="number" defaultValue={3} />
              <input className="field-input" name="rest" placeholder="Descanso (seg)" type="number" defaultValue={60} />
              <input className="field-input" name="reps" placeholder="Repeticiones" type="number" />
              <input className="field-input" name="time" placeholder="Tiempo (ej: 45 seg)" type="text" />
            </div>
            <button className="secondary-button w-full" type="submit">
              Agregar a la rutina
            </button>
          </form>
        )}
      </article>
    </section>
  );
}
