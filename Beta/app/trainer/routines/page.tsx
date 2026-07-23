import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getRoutines } from "@/lib/data/trainer";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SectionHeader } from "@/app/components/shared/SectionHeader";

export default async function TrainerRoutinesPage() {
  const { supabase, user } = await requireProfile("trainer");
  const routines = await getRoutines(supabase, user.id);

  return (
    <section className="space-y-5">
      <SectionHeader
        action={
          <Link className="premium-button whitespace-nowrap px-4 py-3 text-sm" href="/trainer/routines/new">
            <Plus size={16} strokeWidth={2.5} />
            Rutina
          </Link>
        }
        eyebrow="Biblioteca del entrenador"
        icon={ClipboardList}
        title="Rutinas"
      />

      {routines.length === 0 ? (
        <EmptyState
          description="Armá la primera para poder asignarla a tus alumnos."
          icon={ClipboardList}
          title="Todavía no creaste rutinas"
        />
      ) : (
        <div className="space-y-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          {routines.map((routine) => (
            <Link className="glass-card block rounded-[2rem] p-5 transition hover:shadow-soft" href={`/trainer/routines/${routine.id}`} key={routine.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-text-muted">{routine.goal || "Sin objetivo"}</p>
                  <h2 className="mt-1 text-2xl font-bold text-primary">{routine.name}</h2>
                </div>
                <span className="rounded-full bg-soft px-3 py-1 text-sm font-bold text-primary">
                  {routine.estimated_minutes} min
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {routine.exercises.length === 0 ? (
                  <p className="text-sm text-text-muted">Sin ejercicios todavía.</p>
                ) : (
                  routine.exercises.map((exercise) => (
                    <div className="flex justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={exercise.id}>
                      <span className="font-bold">{exercise.name}</span>
                      <span className="text-text-muted">
                        {exercise.sets} x {exercise.reps ?? exercise.time ?? "-"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
