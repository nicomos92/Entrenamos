import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { IconBadge } from "@/app/components/shared/IconBadge";
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
          <IconBadge icon={Dumbbell} />
          <h1 className="text-3xl font-bold text-text-primary">Nuevo ejercicio</h1>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-6">
        <ActionForm
          action={createExercise}
          submitLabel="Crear ejercicio"
          fields={[
            { name: "name", label: "Nombre", type: "text" },
            { name: "focus", label: "Foco (ej: Piernas, Core)", type: "text", required: false },
            { name: "sets", label: "Series", type: "number", defaultValue: "3" },
            { name: "reps", label: "Repeticiones (dejar vacío si usás tiempo)", type: "number", required: false },
            { name: "time", label: "Tiempo (ej: 45 seg)", type: "text", required: false },
            { name: "rest", label: "Descanso (segundos)", type: "number", defaultValue: "60" },
          ]}
        />
      </div>
    </section>
  );
}
