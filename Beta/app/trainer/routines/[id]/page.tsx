import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ListChecks, PlusCircle, Dumbbell } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getExercises } from "@/lib/data/trainer";
import { DeleteButton } from "@/app/components/shared/DeleteButton";
import { deleteRoutine, removeExerciseFromRoutine } from "@/app/trainer/routines/actions";
import { AddExerciseForm } from "@/app/trainer/routines/[id]/AddExerciseForm";

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
      .select("id, sets, reps, time, rest, order_index, intensity_pct, exercises(id, name, focus, rm)")
      .eq("routine_id", id)
      .order("order_index", { ascending: true }),
    getExercises(supabase, user.id),
  ]);

  const safeRoutineExercises = routineExercises ?? [];
  const reIds = safeRoutineExercises.map((re) => re.id);
  const { data: rawSetsData } = reIds.length > 0
    ? await supabase
        .from("routine_exercise_sets")
        .select("id, routine_exercise_id, set_number, reps, weight_kg")
        .in("routine_exercise_id", reIds)
        .order("set_number", { ascending: true })
    : { data: [] };
  const setsData = rawSetsData ?? [];

  const setsByRe: Record<string, typeof setsData> = {};
  for (const s of setsData) {
    if (!setsByRe[s.routine_exercise_id]) setsByRe[s.routine_exercise_id] = [];
    setsByRe[s.routine_exercise_id].push(s);
  }

  const boundDelete = deleteRoutine.bind(null, id);

  const formatSetsInfo = (re: typeof safeRoutineExercises[0]) => {
    const sets = setsByRe[re.id];
    if (!sets || sets.length === 0) {
      return `Series: ${re.sets} · ${re.reps ?? re.time ?? "-"}`;
    }
    const parts = sets.map((s) => {
      let label = `${s.reps ?? "-"} reps`;
      if (s.weight_kg != null) label += ` @ ${s.weight_kg}kg`;
      return `S${s.set_number}: ${label}`;
    });
    return parts.join(" | ");
  };

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
        {safeRoutineExercises.length === 0 ? (
          <p className="text-text-muted">Todavía no agregaste ejercicios.</p>
        ) : (
          <div className="space-y-2">
            {safeRoutineExercises.map((re) => {
              const ex = re.exercises as unknown as { name: string; focus: string; rm: number | null } | null;
              return (
                <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={re.id}>
                  <div>
                    <p className="font-bold">{ex?.name}</p>
                    <p className="text-xs text-text-muted">
                      {formatSetsInfo(re)} · descanso {re.rest}s
                      {re.intensity_pct != null && ` · ${re.intensity_pct}%`}
                    </p>
                    {ex?.rm && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                        <Dumbbell size={10} strokeWidth={2.5} />
                        RM: {ex.rm}
                      </p>
                    )}
                  </div>
                  <DeleteButton action={removeExerciseFromRoutine.bind(null, id, re.id)} confirmMessage="¿Quitar este ejercicio de la rutina?" />
                </div>
              );
            })}
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
          <AddExerciseForm routineId={id} exercises={exercises} />
        )}
      </article>
    </section>
  );
}
