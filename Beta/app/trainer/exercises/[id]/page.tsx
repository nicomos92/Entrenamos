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
          <IconBadge icon={<Pencil size={20} strokeWidth={2.25} />} />
          <h1 className="text-3xl font-bold text-text-primary">Editar ejercicio</h1>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-6">
        {exercise.image_url && (
          <div className="mb-4 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={exercise.name} className="w-full object-cover" src={exercise.image_url} />
          </div>
        )}

        <ActionForm
          action={boundUpdate}
          submitLabel="Guardar cambios"
          fields={[
            { name: "name", label: "Nombre", type: "text", defaultValue: exercise.name },
            { name: "description", label: "Descripción", type: "textarea", required: false, defaultValue: exercise.description ?? "" },
            { name: "focus", label: "Grupo / Foco", type: "text", defaultValue: exercise.focus, required: false },
            { name: "rm", label: "Repetición máxima (RM)", type: "number", required: false, defaultValue: exercise.rm != null ? String(exercise.rm) : "" },
            { name: "image", label: "Cambiar imagen", type: "file", required: false, placeholder: "image/png,image/jpeg,image/webp,image/gif" },
            { name: "image_url", label: "O URL de imagen", type: "text", defaultValue: exercise.image_url ?? "", required: false },
            { name: "video_url", label: "URL de video demostrativo", type: "text", defaultValue: exercise.video_url ?? "", required: false },
          ]}
        />
      </div>
    </section>
  );
}
