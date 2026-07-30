"use client";

import Link from "next/link";
import { ImageIcon, Pencil, Dumbbell } from "lucide-react";
import { SearchList } from "@/app/components/shared/SearchList";
import { DeleteButton } from "@/app/components/shared/DeleteButton";
import { deleteExercise } from "@/app/trainer/exercises/actions";

interface ExerciseView {
  id: string;
  name: string;
  focus: string;
  description: string | null;
  image_url: string | null;
  rm: number | null;
}

export function ExercisesList({ exercises }: { exercises: ExerciseView[] }) {
  return (
    <SearchList
      emptyDescription="Sumá el primero para poder armar rutinas."
      icon={<Dumbbell size={26} strokeWidth={2.25} />}
      items={exercises}
      placeholder="Buscar por nombre, grupo o descripción..."
      renderItem={(exercise) => (
        <article className="glass-card rounded-3xl p-4" key={exercise.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {exercise.image_url ? (
                <img
                  alt={exercise.name}
                  className="size-10 shrink-0 rounded-xl object-cover"
                  src={exercise.image_url}
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-soft">
                  <ImageIcon size={16} className="text-text-muted" strokeWidth={2} />
                </div>
              )}
                <div>
                  <p className="font-bold">{exercise.name}</p>
                  <p className="text-sm text-text-muted">
                    {exercise.focus || "Sin grupo"}
                    {exercise.rm ? ` · RM: ${exercise.rm} reps` : ""}
                    {exercise.description ? ` · ${exercise.description.slice(0, 40)}${exercise.description.length > 40 ? "…" : ""}` : ""}
                  </p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                className="inline-flex items-center gap-1 rounded-full bg-white/50 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-white/70"
                href={`/trainer/exercises/${exercise.id}`}
              >
                <Pencil size={12} strokeWidth={2.5} />
                Editar
              </Link>
              <DeleteButton action={deleteExercise.bind(null, exercise.id)} confirmMessage={`¿Eliminar "${exercise.name}"?`} />
            </div>
          </div>
        </article>
      )}
      searchFields={["name", "focus", "description"]}
    />
  );
}
