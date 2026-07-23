"use client";

import { useMemo, useState, useTransition } from "react";
import { Repeat, Timer, Gauge, CheckCircle2, ArrowRight } from "lucide-react";
import { Metric } from "@/app/components/shared/Metric";
import { finishSession } from "@/app/student/workout/actions";
import type { AssignedRoutine } from "@/lib/data/student";

export function WorkoutClient({ assignment }: { assignment: AssignedRoutine }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [effort, setEffort] = useState(3);
  const [startedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  const exercise = assignment.exercises[activeIndex];
  const progress = Math.round(((activeIndex + 1) / assignment.exercises.length) * 100);

  const finish = useMemo(
    () => (completed: string[]) => {
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
      startTransition(() => {
        finishSession({
          assignmentId: assignment.assignmentId,
          routineId: assignment.routineId,
          totalExercises: assignment.exercises.length,
          completedExerciseIds: completed,
          effort,
          elapsedMinutes,
        });
      });
    },
    [assignment, effort, startedAt]
  );

  const toggleComplete = () => {
    setCompletedIds((ids) => (ids.includes(exercise.id) ? ids : [...ids, exercise.id]));
  };

  const goNext = () => {
    if (activeIndex < assignment.exercises.length - 1) {
      setActiveIndex((index) => index + 1);
      return;
    }
    finish(completedIds);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-text-muted">
          Ejercicio {activeIndex + 1} de {assignment.exercises.length}
        </p>
        <p className="text-4xl font-bold text-primary">{progress}%</p>
      </div>
      <div className="h-3 rounded-full bg-white/50">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>

      <article className="glass-card overflow-hidden rounded-[2rem]">
        <div className="relative h-56 bg-gradient-to-br from-soft via-white to-secondary/40 p-6">
          <div className="absolute inset-x-8 bottom-8 h-16 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative z-10 flex h-full flex-col justify-end">
            <span className="mb-3 w-fit rounded-full bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
              {exercise.focus || "General"}
            </span>
            <h1 className="text-4xl font-bold text-primary">{exercise.name}</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5">
          <Metric icon={Repeat} label="Series" value={`${exercise.sets} x ${exercise.reps ?? exercise.time ?? "-"}`} />
          <Metric icon={Timer} label="Descanso" value={`${exercise.rest} seg`} />
        </div>
      </article>

      <div>
        <p className="mb-3 flex items-center justify-center gap-2 text-center text-sm font-bold uppercase tracking-[0.28em] text-text-muted">
          <Gauge size={14} strokeWidth={2.5} />
          Nivel de esfuerzo (RPE)
        </p>
        <div className="glass-card grid grid-cols-5 gap-2 rounded-3xl p-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              className={`rounded-2xl py-3 text-2xl font-bold transition ${effort === value ? "bg-secondary text-white shadow-glow" : "text-primary"}`}
              key={value}
              onClick={() => setEffort(value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-sm text-text-muted">
          <span>Fácil</span>
          <span>Al límite</span>
        </div>
      </div>

      <button className="premium-button w-full" disabled={isPending} onClick={toggleComplete} type="button">
        <CheckCircle2 size={18} strokeWidth={2.5} />
        {completedIds.includes(exercise.id) ? "Ejercicio completado" : "Marcar completado"}
      </button>
      <button className="secondary-button w-full" disabled={isPending} onClick={goNext} type="button">
        {activeIndex === assignment.exercises.length - 1 ? "Ver resumen" : "Siguiente ejercicio"}
        <ArrowRight size={18} strokeWidth={2.5} />
      </button>
      <button
        className="ghost-button w-full"
        disabled={isPending}
        onClick={() => finish(completedIds)}
        type="button"
      >
        Terminar incompleto
      </button>
    </section>
  );
}
