import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ListChecks, PlusCircle, CalendarRange, Copy } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getExercises } from "@/lib/data/trainer";
import { DeleteButton } from "@/app/components/shared/DeleteButton";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { deleteRoutine, updateRoutine, publishRoutine } from "@/app/trainer/routines/actions";
import { AddExerciseForm } from "@/app/trainer/routines/[id]/AddExerciseForm";
import { ExerciseDayList } from "@/app/trainer/routines/[id]/ExerciseDayList";
import { DuplicateButton, PausarButton } from "@/app/trainer/routines/[id]/RoutineActions";

const DIAS_SEMANA_LABEL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireProfile("trainer");

  const { data: routine } = await supabase
    .from("routines")
    .select("id, name, goal, estimated_minutes, status, start_date, end_date, days, start_weekday")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single();

  if (!routine) notFound();

  const [{ data: routineExercises }, exercises] = await Promise.all([
    supabase
      .from("routine_exercises")
      .select("id, exercise_id, sets, reps, time, rest, order_index, intensity_pct, day_number, exercises(id, name, focus, rm)")
      .eq("routine_id", id)
      .order("day_number", { ascending: true })
      .order("order_index", { ascending: true }),
    getExercises(supabase, user.id),
  ]);

  const safeRoutineExercises = routineExercises ?? [];
  const reIds = safeRoutineExercises.map((re) => re.id);
  const { data: rawSetsData } = reIds.length > 0
    ? await supabase
        .from("routine_exercise_sets")
        .select("id, routine_exercise_id, set_number, reps, weight_kg, unit, duration_seconds")
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
  const boundUpdate = updateRoutine.bind(null, id);
  const boundPublish = publishRoutine.bind(null, id);

  const exerciseOptions = exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    focus: ex.focus,
    rm: ex.rm,
  }));

  const days = Math.max(1, routine.days ?? 1);

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
            <p className="text-text-muted">
              {routine.estimated_minutes} min estimados · {days} {days === 1 ? "día" : "días"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  routine.status === "activa" ? "bg-primary/10 text-primary" : "bg-text-muted/10 text-text-muted"
                }`}
              >
                <span className={`size-1.5 rounded-full ${routine.status === "activa" ? "bg-primary" : "bg-text-muted"}`} />
                {routine.status === "activa" ? "Activa" : "Borrador"}
              </span>
              {routine.start_date && routine.end_date && (
                <span className="inline-flex items-center gap-1 rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
                  <CalendarRange size={12} strokeWidth={2.5} />
                  {routine.start_date} al {routine.end_date}
                </span>
              )}
              <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary">
                Empieza los {DIAS_SEMANA_LABEL[routine.start_weekday ?? 1]}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="flex gap-2">
              <DuplicateButton routineId={id} />
              {routine.status === "activa" && <PausarButton routineId={id} />}
              <DeleteButton action={boundDelete} confirmMessage={`¿Eliminar la rutina "${routine.name}"? Esto no se puede deshacer.`} />
            </div>
          </div>
        </div>
      </div>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <Copy size={14} strokeWidth={2.5} />
          Detalles y estado
        </p>

        {routine.status === "borrador" ? (
          <div className="mb-4 rounded-2xl bg-white/30 p-4 text-sm">
            <p className="mb-2 text-text-muted">
              Esta rutina es un borrador. Definí las fechas de uso para activarla y poder asignarla.
            </p>
            <ActionForm
              action={boundPublish}
              submitLabel="Publicar rutina"
              fields={[
                { name: "start_date", label: "Fecha de inicio de uso", type: "date", required: true },
                { name: "end_date", label: "Fecha de fin de uso", type: "date", required: true },
              ]}
            />
          </div>
        ) : (
          <p className="mb-4 text-sm text-text-muted">
            La rutina está activa. Solo se puede usar dentro de su rango de fechas.
          </p>
        )}

        <details>
          <summary className="cursor-pointer text-sm font-bold text-primary">Editar detalles de la rutina</summary>
          <div className="mt-4">
            <ActionForm
              action={boundUpdate}
              submitLabel="Guardar cambios"
              fields={[
                { name: "name", label: "Nombre", type: "text", required: true, defaultValue: routine.name },
                { name: "goal", label: "Objetivo", type: "text", required: false, defaultValue: routine.goal },
                { name: "estimated_minutes", label: "Minutos estimados", type: "number", required: true, defaultValue: String(routine.estimated_minutes) },
                { name: "days", label: "Cantidad de días (1-7)", type: "number", required: true, defaultValue: String(routine.days ?? 1) },
                {
                  name: "start_weekday",
                  label: "Primer día de la semana",
                  type: "select",
                  required: true,
                  defaultValue: String(routine.start_weekday ?? 1),
                  options: DIAS_SEMANA_LABEL.map((d, i) => ({ value: String(i), label: d })),
                },
              ]}
            />
          </div>
        </details>
      </article>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <ListChecks size={14} strokeWidth={2.5} />
          Ejercicios
        </p>

        {safeRoutineExercises.length === 0 ? (
          <p className="text-text-muted">Todavía no agregaste ejercicios.</p>
        ) : (
          <div className="space-y-5">
            {Array.from({ length: days }, (_, dayIdx) => {
              const day = dayIdx + 1;
              const dayExercises = safeRoutineExercises.filter((re) => (re.day_number ?? 1) === day);
              return (
                <div key={day}>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">Día {day}</p>
                  {dayExercises.length === 0 ? (
                    <p className="text-xs text-text-muted">Sin ejercicios en este día.</p>
                  ) : (
                    <ExerciseDayList
                      days={days}
                      dayNumber={day}
                      exercises={exerciseOptions}
                      items={dayExercises.map((re) => {
                        const ex = re.exercises as unknown as { name: string; focus: string; rm: number | null } | null;
                        return {
                          id: re.id,
                          exerciseId: re.exercise_id,
                          name: ex?.name ?? "Ejercicio",
                          rm: ex?.rm ?? null,
                          sets: re.sets,
                          reps: re.reps,
                          time: re.time,
                          rest: re.rest,
                          intensityPct: re.intensity_pct,
                          dayNumber: re.day_number ?? 1,
                          setsConfig: (setsByRe[re.id] ?? []).map((s) => ({
                            setNumber: s.set_number,
                            reps: s.reps,
                            weightKg: s.weight_kg,
                            unit: s.unit === "time" ? ("time" as const) : ("reps" as const),
                            durationSeconds: s.duration_seconds,
                          })),
                        };
                      })}
                      routineId={id}
                    />
                  )}
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
        {exerciseOptions.length === 0 ? (
          <p className="text-text-muted">
            No tenés ejercicios cargados.{" "}
            <Link className="font-bold text-primary" href="/trainer/exercises/new">
              Creá uno
            </Link>
            .
          </p>
        ) : (
          <AddExerciseForm days={days} exercises={exerciseOptions} routineId={id} />
        )}
      </article>
    </section>
  );
}
