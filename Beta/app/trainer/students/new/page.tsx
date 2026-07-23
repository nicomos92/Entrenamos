import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { IconBadge } from "@/app/components/shared/IconBadge";
import { createStudent } from "@/app/trainer/students/actions";

export default function NewStudentPage() {
  return (
    <section className="space-y-5">
      <div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary" href="/trainer/students">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Alumnos
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <IconBadge icon={UserPlus} />
          <h1 className="text-3xl font-bold text-text-primary">Nuevo alumno</h1>
        </div>
        <p className="mt-2 text-text-muted">
          Creamos una cuenta para que pueda entrar a EntrenaMos con este email y contraseña. Se los compartís vos.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] p-6">
        <ActionForm
          action={createStudent}
          submitLabel="Crear alumno"
          fields={[
            { name: "full_name", label: "Nombre y apellido", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Contraseña inicial", type: "text" },
            { name: "note", label: "Nota (opcional)", type: "textarea", required: false },
          ]}
        />
      </div>
    </section>
  );
}
