import { Metric } from "@/app/components/shared/Metric";
import { currentUser } from "@/app/data/users";
import { workouts } from "@/app/data/workouts";
import { WeeklyProgress } from "@/app/types";

interface StudentHomeViewProps {
  weeklyProgress: WeeklyProgress;
  onStartWorkout: () => void;
}

export function StudentHomeView({ weeklyProgress, onStartWorkout }: StudentHomeViewProps) {
  const studentWorkout = workouts[0];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-text-muted">Hola, {currentUser.name}. Tu programación está lista.</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-text-primary">¿Qué toca hoy?</h1>
      </div>

      <article className="glass-card rounded-[2rem] p-6">
        <div className="mb-5 flex items-center justify-between">
          <span className="rounded-full bg-[#BAE6FD] px-4 py-2 text-sm font-bold text-primary">Entrenamiento central</span>
          <span className="font-bold text-primary">{studentWorkout.estimatedMinutes} min</span>
        </div>
        <h2 className="text-3xl font-bold leading-tight text-primary">Rutina del día: {studentWorkout.name}</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Metric label="Enfoque" value="Empuje y core" />
          <Metric label="Intensidad" value="RPE 8" />
        </div>
        <button className="premium-button mt-6 w-full" onClick={onStartWorkout}>
          Iniciar entrenamiento
        </button>
      </article>

      <article className="glass-card rounded-[1.75rem] p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-text-primary">Objetivo semanal</p>
          <p className="text-2xl font-semibold text-primary">
            {weeklyProgress.done}/{weeklyProgress.goal}
          </p>
        </div>
        <div className="mt-5 h-3 rounded-full bg-[#E5EEFF]">
          <div className="h-full rounded-full bg-[#5BB8FE]" style={{ width: `${weeklyProgress.percentage}%` }} />
        </div>
        <p className="mt-4 text-sm text-text-muted">Estás a {weeklyProgress.goal - weeklyProgress.done} sesiones de tu meta. Mantené el ritmo.</p>
      </article>
    </section>
  );
}
