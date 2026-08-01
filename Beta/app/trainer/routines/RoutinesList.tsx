"use client";

import Link from "next/link";
import { ClipboardList, CalendarRange } from "lucide-react";
import { SearchList } from "@/app/components/shared/SearchList";

interface ExerciseView {
  id: string;
  name: string;
  sets: number;
  reps: number | null;
  time: string | null;
}

interface RoutineView {
  id: string;
  name: string;
  goal: string;
  estimated_minutes: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  days: number;
  exercises: ExerciseView[];
}

export function RoutinesList({ routines }: { routines: RoutineView[] }) {
  return (
    <SearchList
      emptyDescription="Armá la primera para poder asignarla a tus alumnos."
      icon={<ClipboardList size={26} strokeWidth={2.25} />}
      items={routines}
      placeholder="Buscar por nombre, objetivo..."
      renderItem={(routine) => (
        <Link className="glass-card block rounded-[2rem] p-5 transition hover:shadow-soft" href={`/trainer/routines/${routine.id}`} key={routine.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-text-muted">{routine.goal || "Sin objetivo"}</p>
              <h2 className="mt-1 text-2xl font-bold text-primary">{routine.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    routine.status === "activa" ? "bg-primary/10 text-primary" : "bg-text-muted/10 text-text-muted"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${routine.status === "activa" ? "bg-primary" : "bg-text-muted"}`} />
                  {routine.status === "activa" ? "Activa" : "Borrador"}
                </span>
                {routine.days > 1 && (
                  <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                    {routine.days} días
                  </span>
                )}
                {routine.start_date && routine.end_date && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                    <CalendarRange size={11} strokeWidth={2.5} />
                    {routine.start_date} al {routine.end_date}
                  </span>
                )}
              </div>
            </div>
            <span className="rounded-full bg-soft px-3 py-1 text-sm font-bold text-primary">
              {routine.estimated_minutes} min
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {routine.exercises.length === 0 ? (
              <p className="text-sm text-text-muted">Sin ejercicios todavía.</p>
            ) : (
              routine.exercises.slice(0, 4).map((exercise) => (
                <div className="flex justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={exercise.id}>
                  <span className="font-bold">{exercise.name}</span>
                  <span className="text-text-muted">
                    {exercise.sets} x {exercise.reps ?? exercise.time ?? "-"}
                  </span>
                </div>
              ))
            )}
            {routine.exercises.length > 4 && (
              <p className="text-center text-xs text-text-muted">
                +{routine.exercises.length - 4} ejercicios más
              </p>
            )}
          </div>
        </Link>
      )}
      searchFields={["name", "goal"]}
    />
  );
}
