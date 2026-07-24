import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { IconBadge } from "@/app/components/shared/IconBadge";
import { createRoutine } from "@/app/trainer/routines/actions";

export default function NewRoutinePage() {
  return (
    <section className="space-y-5">
      <div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary" href="/trainer/routines">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Rutinas
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <IconBadge icon={<ClipboardList size={20} strokeWidth={2.25} />} />
          <h1 className="text-3xl font-bold text-text-primary">Nueva rutina</h1>
        </div>
        <p className="mt-2 text-text-muted">Después de crearla vas a poder sumarle ejercicios de tu biblioteca.</p>
      </div>

      <div className="glass-card rounded-[2rem] p-6">
        <ActionForm
          action={createRoutine}
          submitLabel="Crear rutina"
          fields={[
            { name: "name", label: "Nombre", type: "text" },
            { name: "goal", label: "Objetivo (ej: Fuerza general)", type: "text", required: false },
            { name: "estimated_minutes", label: "Duración estimada (min)", type: "number", defaultValue: "30" },
          ]}
        />
      </div>
    </section>
  );
}
