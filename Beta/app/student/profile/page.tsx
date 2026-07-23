import { Dumbbell, Gauge, Scale, User } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { Metric } from "@/app/components/shared/Metric";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { TrendSparkline } from "@/app/components/shared/TrendSparkline";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { getBodyMetrics, buildTrend } from "@/lib/data/bodyMetrics";
import { updateFullName, logBodyMetric } from "@/app/student/profile/actions";

export default async function StudentProfilePage() {
  const { supabase, user, profile } = await requireProfile("student");

  const [{ count: totalSessions }, { data: effortRows }, metrics] = await Promise.all([
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("student_id", user.id),
    supabase.from("sessions").select("effort").eq("student_id", user.id).not("effort", "is", null),
    getBodyMetrics(supabase, user.id),
  ]);

  const efforts = (effortRows ?? []).map((r) => r.effort as number);
  const avgEffort = efforts.length ? (efforts.reduce((a, b) => a + b, 0) / efforts.length).toFixed(1) : "-";

  const weightTrend = buildTrend(metrics, "weightKg");
  const latest = metrics[0];

  return (
    <section className="space-y-6">
      <SectionHeader eyebrow="Tu información" icon={User} title="Perfil" />

      <div className="grid grid-cols-2 gap-3">
        <Metric icon={Dumbbell} label="Entrenamientos" value={`${totalSessions ?? 0}`} />
        <Metric icon={Gauge} label="Esfuerzo promedio" value={`${avgEffort}`} />
      </div>

      <article className="glass-card rounded-[2rem] p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
            <Scale size={14} strokeWidth={2.5} />
            Composición corporal
          </p>
          {weightTrend.deltaFromFirst != null && (
            <span className="text-sm font-bold text-primary">
              {weightTrend.deltaFromFirst > 0 ? "+" : ""}
              {weightTrend.deltaFromFirst} kg desde el inicio
            </span>
          )}
        </div>

        {latest ? (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Metric icon={Scale} label="Peso" value={latest.weightKg != null ? `${latest.weightKg} kg` : "-"} />
            <Metric icon={Scale} label="Altura" value={latest.heightCm != null ? `${latest.heightCm} cm` : "-"} />
            <Metric icon={Scale} label="Grasa corporal" value={latest.bodyFatPct != null ? `${latest.bodyFatPct}%` : "-"} />
            <Metric icon={Scale} label="Masa muscular" value={latest.muscleMassKg != null ? `${latest.muscleMassKg} kg` : "-"} />
          </div>
        ) : (
          <p className="mb-4 text-text-muted">Todavía no registraste ninguna medición.</p>
        )}

        {weightTrend.points.length >= 2 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Peso a lo largo del tiempo</p>
            <TrendSparkline points={weightTrend.points} />
          </div>
        )}

        <ActionForm
          action={logBodyMetric}
          submitLabel="Guardar medición"
          fields={[
            { name: "weight_kg", label: "Peso (kg)", type: "number", required: false },
            { name: "height_cm", label: "Altura (cm)", type: "number", required: false },
            { name: "body_fat_pct", label: "Grasa corporal (%)", type: "number", required: false },
            { name: "muscle_mass_kg", label: "Masa muscular (kg)", type: "number", required: false },
            { name: "notes", label: "Notas (opcional)", type: "textarea", required: false },
          ]}
        />

        {metrics.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Historial</p>
            {metrics.slice(0, 6).map((entry) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={entry.id}>
                <span className="text-text-muted">{new Date(entry.recordedAt).toLocaleDateString("es-AR")}</span>
                <span className="font-bold">
                  {entry.weightKg != null ? `${entry.weightKg} kg` : "-"}
                  {entry.bodyFatPct != null ? ` · ${entry.bodyFatPct}% grasa` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="glass-card rounded-[2rem] p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <User size={14} strokeWidth={2.5} />
          Datos personales
        </p>
        <p className="mb-4 text-text-muted">{profile.email}</p>
        <ActionForm
          action={updateFullName}
          submitLabel="Guardar nombre"
          fields={[{ name: "full_name", label: "Nombre y apellido", type: "text", defaultValue: profile.full_name }]}
        />
      </article>
    </section>
  );
}
