import { Users, UserPlus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { createTrainer } from "@/app/admin/actions";

export default async function AdminPage() {
  const { supabase } = await requireProfile("admin");

  const { data: trainers } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "trainer")
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-6">
      <SectionHeader eyebrow="Gestión de entrenadores" icon={<Users size={20} strokeWidth={2.25} />} title="Clientes SIMos" />

      <article className="glass-card rounded-[2rem] p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <UserPlus size={14} strokeWidth={2.5} />
          Nuevo entrenador
        </p>
        <ActionForm
          action={createTrainer}
          submitLabel="Crear entrenador"
          fields={[
            { name: "full_name", label: "Nombre y apellido", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Contraseña inicial", type: "text" },
          ]}
        />
      </article>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          Entrenadores ({trainers?.length ?? 0})
        </p>
        {!trainers || trainers.length === 0 ? (
          <EmptyState description="Creá el primero con el formulario de arriba." icon={<Users size={26} strokeWidth={2.25} />} title="Todavía no creaste ningún entrenador" />
        ) : (
          <div className="space-y-2">
            {trainers.map((trainer) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={trainer.id}>
                <div>
                  <p className="font-bold">{trainer.full_name}</p>
                  <p className="text-text-muted">{trainer.email}</p>
                </div>
                <p className="text-text-muted">{new Date(trainer.created_at).toLocaleDateString("es-AR")}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
