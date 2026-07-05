import { Metric } from "@/app/components/shared/Metric";
import { workouts } from "@/app/data/workouts";

interface SummaryViewProps {
  coachNote: string;
  completed: number;
  effort: number;
  elapsedMinutes: number;
  isComplete: boolean;
  onCoachNoteChange: (note: string) => void;
  onHome: () => void;
}

export function SummaryView({
  coachNote,
  completed,
  effort,
  elapsedMinutes,
  isComplete,
  onCoachNoteChange,
  onHome,
}: SummaryViewProps) {
  const studentWorkout = workouts[0];

  return (
    <section className="space-y-6 text-center">
      <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#BAE6FD] text-3xl font-bold text-primary">OK</div>
      <div>
        <h1 className="text-4xl font-bold text-primary">{isComplete ? "¡Entrenamiento completado!" : "Rutina incompleta"}</h1>
        <p className="mt-2 text-text-muted">{isComplete ? "¡Increíble trabajo hoy!" : "Guardamos tu progreso para revisar con el entrenador."}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-left">
        <Metric label="Tiempo total" value={`${elapsedMinutes} min`} />
        <Metric label="Ejercicios" value={`${completed}/${studentWorkout.exercises.length}`} />
      </div>
      <Metric label="Feedback de esfuerzo" value={`Esfuerzo: ${effort}/5`} />

      <label className="block text-left">
        <span className="text-sm font-bold uppercase tracking-[0.22em] text-text-muted">Nota del entrenador</span>
        <textarea
          className="mt-3 min-h-32 w-full rounded-3xl border border-white/50 bg-white/40 p-5 text-text-primary outline-none transition focus:border-secondary"
          value={coachNote}
          onChange={(event) => onCoachNoteChange(event.target.value)}
        />
      </label>

      <button className="premium-button w-full" onClick={onHome}>
        Volver al inicio
      </button>
    </section>
  );
}
