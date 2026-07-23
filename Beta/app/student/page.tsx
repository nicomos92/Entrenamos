import Link from "next/link";
import { Target, ListChecks, Flame, Play } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getActiveAssignment, getWeeklyProgress } from "@/lib/data/student";
import { Metric } from "@/app/components/shared/Metric";
import { EmptyState } from "@/app/components/shared/EmptyState";

export default async function StudentHomePage() {
  const { supabase, user, profile } = await requireProfile("student");
  const [assignment, weeklyProgress] = await Promise.all([
    getActiveAssignment(supabase, user.id),
    getWeeklyProgress(supabase, user.id),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-text-muted">Hola, {profile.full_name.split(" ")[0]}. Tu programación está lista.</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-text-primary">¿Qué toca hoy?</h1>
      </div>

      {!assignment ? (
        <EmptyState
          description="Tu entrenador te va a asignar una pronto."
          icon={ListChecks}
          title="Todavía no tenés una rutina asignada"
        />
      ) : (
        <article className="glass-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="rounded-full bg-soft px-4 py-2 text-sm font-bold text-primary">Entrenamiento central</span>
            <span className="font-bold text-primary">{assignment.estimatedMinutes} min</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight text-primary">Rutina del día: {assignment.name}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric icon={Target} label="Objetivo" value={assignment.goal || "General"} />
            <Metric icon={ListChecks} label="Ejercicios" value={`${assignment.exercises.length}`} />
          </div>
          <Link className="premium-button mt-6 w-full" href="/student/workout">
            <Play size={18} strokeWidth={2.5} />
            Iniciar entrenamiento
          </Link>
        </article>
      )}

      <article className="glass-card rounded-[1.75rem] p-6">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-text-primary">
            <Flame size={14} strokeWidth={2.5} />
            Objetivo semanal
          </p>
          <p className="text-2xl font-semibold text-primary">
            {weeklyProgress.done}/{weeklyProgress.goal}
          </p>
        </div>
        <div className="mt-5 h-3 rounded-full bg-surface">
          <div className="h-full rounded-full bg-secondary" style={{ width: `${weeklyProgress.percentage}%` }} />
        </div>
        <p className="mt-4 text-sm text-text-muted">
          {weeklyProgress.done >= weeklyProgress.goal
            ? "¡Cumpliste tu meta semanal!"
            : `Estás a ${weeklyProgress.goal - weeklyProgress.done} sesiones de tu meta. Mantené el ritmo.`}
        </p>
      </article>
    </section>
  );
}
