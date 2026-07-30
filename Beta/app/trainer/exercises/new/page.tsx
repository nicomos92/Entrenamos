import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { IconBadge } from "@/app/components/shared/IconBadge";
import { ExerciseForm } from "@/app/trainer/exercises/ExerciseForm";
import { createExercise } from "@/app/trainer/exercises/actions";

export default function NewExercisePage() {
  return (
    <section className="space-y-5">
      <div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary" href="/trainer/exercises">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Ejercicios
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <IconBadge icon={<Dumbbell size={20} strokeWidth={2.25} />} />
          <h1 className="text-3xl font-bold text-text-primary">Nuevo ejercicio</h1>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-6">
        <ExerciseForm action={createExercise} submitLabel="Crear ejercicio" />
      </div>
    </section>
  );
}
