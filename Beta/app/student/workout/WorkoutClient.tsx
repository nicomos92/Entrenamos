"use client";

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { Repeat, Timer, Gauge, CheckCircle2, ArrowRight, ImageIcon, Video, Play, SkipForward } from "lucide-react";
import { Metric } from "@/app/components/shared/Metric";
import { finishSession } from "@/app/student/workout/actions";
import type { AssignedRoutine } from "@/lib/data/student";

function RestTimer({ rest, onFinish }: { rest: number; onFinish: () => void }) {
  const [remaining, setRemaining] = useState(rest);

  useEffect(() => {
    if (remaining <= 0) {
      onFinish();
      return;
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining, onFinish]);

  return (
    <div className="glass-card flex flex-col items-center justify-center gap-4 rounded-[2rem] p-10 text-center">
      <Timer size={48} strokeWidth={2} className="text-primary" />
      <p className="text-lg font-bold uppercase tracking-[0.22em] text-text-muted">Descanso</p>
      <p className="text-6xl font-bold text-primary">{remaining}</p>
      <p className="text-sm text-text-muted">Segundos restantes</p>
      <button className="secondary-button mt-2" onClick={onFinish} type="button">
        <SkipForward size={16} strokeWidth={2.5} />
        Saltar descanso
      </button>
    </div>
  );
}

export function WorkoutClient({ assignment }: { assignment: AssignedRoutine }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [effort, setEffort] = useState(3);
  const [startedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const [showRest, setShowRest] = useState(false);
  const restTimerRef = useRef<(() => void) | null>(null);

  const exercise = assignment.exercises[activeIndex];
  const progress = Math.round(((activeIndex + 1) / assignment.exercises.length) * 100);

  const finish = useCallback(
    (completed: string[]) => {
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
    setCompletedIds((ids) => {
      if (ids.includes(exercise.exerciseId)) return ids;
      const newIds = [...ids, exercise.exerciseId];
      if (activeIndex < assignment.exercises.length - 1) {
        setShowRest(true);
      }
      return newIds;
    });
  };

  const goNext = () => {
    if (activeIndex < assignment.exercises.length - 1) {
      setShowRest(false);
      setActiveIndex((index) => index + 1);
      return;
    }
    finish(completedIds);
  };

  const goToExercise = () => {
    setShowRest(false);
    setActiveIndex((index) => index + 1);
  };

  if (showRest && activeIndex < assignment.exercises.length - 1) {
    return (
      <section className="space-y-6">
        <RestTimer rest={exercise.rest} onFinish={goToExercise} />
      </section>
    );
  }

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

        {(exercise.imageUrl || exercise.videoUrl) && (
          <div className="flex gap-2 px-5 pt-3">
            {exercise.imageUrl && (
              <a
                className="flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-white/70"
                href={exercise.imageUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ImageIcon size={12} strokeWidth={2.5} />
                Ver imagen
              </a>
            )}
            {exercise.videoUrl && (
              <a
                className="flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-white/70"
                href={exercise.videoUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Video size={12} strokeWidth={2.5} />
                Ver video
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 p-5">
          <Metric icon={<Repeat size={16} strokeWidth={2.25} />} label="Series" value={`${exercise.sets} x ${exercise.reps ?? exercise.time ?? "-"}`} />
          <Metric icon={<Timer size={16} strokeWidth={2.25} />} label="Descanso" value={`${exercise.rest} seg`} />
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
        {completedIds.includes(exercise.exerciseId) ? "Ejercicio completado" : "Marcar completado"}
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
