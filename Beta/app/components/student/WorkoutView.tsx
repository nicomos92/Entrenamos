import { Metric } from "@/app/components/shared/Metric";
import { workouts } from "@/app/data/workouts";
import { Exercise } from "@/app/types";

interface WorkoutViewProps {
  activeExercise: number;
  completedIds: string[];
  effort: number;
  exercise: Exercise;
  onComplete: () => void;
  onEffortChange: (effort: number) => void;
  onNext: () => void;
  onExit: () => void;
}

export function WorkoutView({
  activeExercise,
  completedIds,
  effort,
  exercise,
  onComplete,
  onEffortChange,
  onNext,
  onExit,
}: WorkoutViewProps) {
  const studentWorkout = workouts[0];
  const progress = Math.round(((activeExercise + 1) / studentWorkout.exercises.length) * 100);

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-text-muted">
          Ejercicio {activeExercise + 1} de {studentWorkout.exercises.length}
        </p>
        <p className="text-4xl font-bold text-primary">{progress}%</p>
      </div>
      <div className="h-3 rounded-full bg-white/50">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>

      <article className="glass-card overflow-hidden rounded-[2rem]">
        <div className="relative h-56 bg-gradient-to-br from-[#BAE6FD] via-[#E0F2FE] to-[#5BB8FE] p-6">
          <div className="absolute inset-x-8 bottom-8 h-16 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative z-10 flex h-full flex-col justify-end">
            <span className="mb-3 w-fit rounded-full bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
              {exercise.focus}
            </span>
            <h1 className="text-4xl font-bold text-primary">{exercise.name}</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5">
          <Metric label="Series" value={`${exercise.sets} x ${exercise.reps ?? exercise.time}`} />
          <Metric label="Descanso" value={`${exercise.rest} seg`} />
        </div>
      </article>

      <div>
        <p className="mb-3 text-center text-sm font-bold uppercase tracking-[0.28em] text-text-muted">Nivel de esfuerzo (RPE)</p>
        <div className="glass-card grid grid-cols-5 gap-2 rounded-3xl p-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              className={`rounded-2xl py-3 text-2xl font-bold transition ${effort === value ? "bg-secondary text-white shadow-glow" : "text-primary"}`}
              key={value}
              onClick={() => onEffortChange(value)}
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

      <button className="premium-button w-full" onClick={onComplete}>
        {completedIds.includes(exercise.id) ? "Ejercicio completado" : "Marcar completado"}
      </button>
      <button className="secondary-button w-full" onClick={onNext}>
        {activeExercise === studentWorkout.exercises.length - 1 ? "Ver resumen" : "Siguiente ejercicio"}
      </button>
      <button className="w-full py-2 text-sm font-bold text-text-muted" onClick={onExit}>
        Terminar incompleto
      </button>
    </section>
  );
}
