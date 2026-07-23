import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { IconBadge } from "@/app/components/shared/IconBadge";
import { updateExercise } from "@/app/trainer/exercises/actions";

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireProfile("trainer");

  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single();

  if (!exercise) notFound();

  const boundUpdate = updateExercise.bind(null, exercise.id);

  return (
    <section className="space-y-5">
      <div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary" href="/trainer/exercises">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Ejercicios
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <IconBadge icon={Pencil} />
          <h1 className="text-3xl font-bold text-text-primary">Editar ejercicio</h1>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-6">
        <ActionForm
          action={boundUpdate}
          submitLabel="Guardar cambios"
          fields={[
            { name: "name", label: "Nombre", type: "text", defaultValue: exercise.name },
            { name: "focus", label: "Foco", type: "text", defaultValue: exercise.focus, required: false },
            { name: "sets", label: "Series", type: "number", defaultValue: String(exercise.default_sets) },
            {
              name: "reps",
              label: "Repeticiones",
              type: "number",
              defaultValue: exercise.default_reps != null ? String(exercise.default_reps) : "",
              required: false,
            },
            { name: "time", label: "Tiempo", type: "text", defaultValue: exercise.default_time ?? "", required: false },
            { name: "rest", label: "Descanso (segundos)", type: "number", defaultValue: String(exercise.default_rest) },
          ]}
        />
      </div>
    </section>
  );
}
