import Link from "next/link";
import { Timer, ListChecks, Gauge, CheckCircle2, RotateCcw, ClipboardList } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getLatestSession, getSessionWithRoutine } from "@/lib/data/student";
import { Metric } from "@/app/components/shared/Metric";
import { IconBadge } from "@/app/components/shared/IconBadge";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SummaryNoteEditor } from "@/app/student/summary/SummaryNoteEditor";

export default async function StudentSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionParam } = await searchParams;
  const { supabase, user } = await requireProfile("student");

  const sessionId = sessionParam ?? (await getLatestSession(supabase, user.id))?.id;
  const session = sessionId ? await getSessionWithRoutine(supabase, sessionId, user.id) : null;

  if (!session) {
    return (
      <section className="space-y-5">
        <EmptyState
          action={
            <Link className="premium-button w-full" href="/student">
              Volver al inicio
            </Link>
          }
          description="Cuando termines tu primera rutina, el resumen va a aparecer acá."
          icon={<ClipboardList size={26} strokeWidth={2.25} />}
          title="Todavía no registraste entrenamientos"
        />
      </section>
    );
  }

  const isComplete = session.status === "completada";

  return (
    <section className="space-y-6 text-center">
      <div className="mx-auto">
        {isComplete ? <IconBadge icon={<CheckCircle2 size={26} strokeWidth={2.25} />} size="lg" /> : <IconBadge icon={<RotateCcw size={26} strokeWidth={2.25} />} size="lg" />}
      </div>
      <div>
        <h1 className="text-4xl font-bold text-primary">{isComplete ? "¡Entrenamiento completado!" : "Rutina incompleta"}</h1>
        <p className="mt-2 text-text-muted">
          {isComplete ? "¡Increíble trabajo hoy!" : "Guardamos tu progreso para revisar con el entrenador."}
        </p>
        <p className="mt-1 text-sm text-text-muted">{session.routineName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-left">
        <Metric icon={<Timer size={16} strokeWidth={2.25} />} label="Tiempo total" value={`${session.elapsed_minutes ?? "-"} min`} />
        <Metric icon={<ListChecks size={16} strokeWidth={2.25} />} label="Ejercicios" value={`${session.completedExercises}/${session.totalExercises}`} />
      </div>
      <Metric icon={<Gauge size={16} strokeWidth={2.25} />} label="Feedback de esfuerzo" value={`Esfuerzo: ${session.effort ?? "-"}/5`} />

      <SummaryNoteEditor initialNote={session.coach_note} sessionId={session.id} />

      <Link className="premium-button w-full" href="/student">
        Volver al inicio
      </Link>
    </section>
  );
}
