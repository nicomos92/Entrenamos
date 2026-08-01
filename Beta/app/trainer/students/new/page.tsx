import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { IconBadge } from "@/app/components/shared/IconBadge";
import { createStudent } from "@/app/trainer/students/actions";

const OBJETIVOS = [
  { value: "Hipertrofia", label: "Hipertrofia" },
  { value: "Descenso de grasa", label: "Descenso de grasa" },
  { value: "Fuerza", label: "Fuerza" },
  { value: "Salud", label: "Salud" },
  { value: "RendimientoDeportivo", label: "Rendimiento deportivo" },
  { value: "Preparacion Fisica", label: "Preparación física" },
];

const SEXOS = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
];

export default function NewStudentPage() {
  return (
    <section className="space-y-5">
      <div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary" href="/trainer/students">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Alumnos
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <IconBadge icon={<UserPlus size={20} strokeWidth={2.25} />} />
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
            { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date", required: false },
            { name: "sexo", label: "Sexo", type: "select", required: false, placeholder: "Seleccionar...", options: SEXOS },
            { name: "objetivo", label: "Objetivo", type: "select", required: false, placeholder: "Seleccionar...", options: OBJETIVOS },
            { name: "fecha_inicio", label: "Fecha de inicio", type: "date", required: false },
            { name: "initial_weight_kg", label: "Peso inicial (kg)", type: "number", required: false },
            { name: "initial_height_cm", label: "Altura inicial (cm)", type: "number", required: false },
            { name: "note", label: "Nota (opcional)", type: "textarea", required: false },
          ]}
        />
      </div>
    </section>
  );
}
