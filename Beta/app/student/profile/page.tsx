import { Dumbbell, Gauge, Scale, User, Target, Cake, Calendar, CalendarClock } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { Metric } from "@/app/components/shared/Metric";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { TrendSparkline } from "@/app/components/shared/TrendSparkline";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { getBodyMetrics, buildTrend } from "@/lib/data/bodyMetrics";
import { updateFullName, logBodyMetric, updateMyProfile } from "@/app/student/profile/actions";
import { DIAS_SEMANA } from "@/lib/supabase/database.types";

function calcularBMI(weightKg: number, heightCm: number): { value: number; label: string } | null {
  if (!weightKg || !heightCm) return null;
  const bmi = weightKg / ((heightCm / 100) * (heightCm / 100));
  const rounded = Math.round(bmi * 10) / 10;
  let label: string;
  if (rounded < 18.5) label = "Bajo peso";
  else if (rounded < 25) label = "Normal";
  else if (rounded < 30) label = "Sobrepeso";
  else label = "Obesidad";
  return { value: rounded, label };
}

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

const calcularEdad = (fecha: string | null): string => {
  if (!fecha) return "-";
  const nacimiento = new Date(fecha);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return `${edad} años`;
};

export default async function StudentProfilePage() {
  const { supabase, user, profile } = await requireProfile("student");

  const [{ count: totalSessions }, { data: effortRows }, metrics, studentData, schedulesData, assignmentData] = await Promise.all([
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("student_id", user.id),
    supabase.from("sessions").select("effort").eq("student_id", user.id).not("effort", "is", null),
    getBodyMetrics(supabase, user.id),
    (async () => {
      try {
        const { data } = await supabase
          .from("students")
          .select("objetivo, fecha_inicio, fecha_nacimiento, sexo")
          .eq("profile_id", user.id)
          .single();
        return { data };
      } catch { return { data: null }; }
    })(),
    (async () => {
      try {
        const { data } = await supabase
          .from("student_schedules")
          .select("*")
          .eq("student_id", user.id)
          .order("dia_semana", { ascending: true });
        return { data };
      } catch { return { data: [] }; }
    })(),
    (async () => {
      try {
        const { data } = await supabase
          .from("assignments")
          .select("id")
          .eq("student_id", user.id)
          .eq("active", true)
          .maybeSingle();
        return { data };
      } catch { return { data: null }; }
    })(),
  ]);

  const student = studentData?.data ?? null;
  const schedules = schedulesData?.data ?? [];
  const hasActiveRoutine = !!assignmentData?.data;

  const efforts = (effortRows ?? []).map((r) => r.effort as number);
  const avgEffort = efforts.length ? (efforts.reduce((a, b) => a + b, 0) / efforts.length).toFixed(1) : "-";

  const weightTrend = buildTrend(metrics, "weightKg");
  const latest = metrics[0];

  return (
    <section className="space-y-6">
      <SectionHeader eyebrow="Tu información" icon={<User size={20} strokeWidth={2.25} />} title="Perfil" />

      <div className="grid grid-cols-2 gap-3">
        <Metric icon={<Dumbbell size={16} strokeWidth={2.25} />} label="Entrenamientos" value={`${totalSessions ?? 0}`} />
        <Metric icon={<Gauge size={16} strokeWidth={2.25} />} label="Esfuerzo promedio" value={`${avgEffort}`} />
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
            <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="Peso" value={latest.weightKg != null ? `${latest.weightKg} kg` : "-"} />
            <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="Altura" value={latest.heightCm != null ? `${latest.heightCm} cm` : "-"} />
            <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="Grasa corporal" value={latest.bodyFatPct != null ? `${latest.bodyFatPct}%` : "-"} />
            <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="Masa muscular" value={latest.muscleMassKg != null ? `${latest.muscleMassKg} kg` : "-"} />
            {(() => {
              const bmi = calcularBMI(latest.weightKg ?? 0, latest.heightCm ?? 0);
              return bmi ? <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="IMC" value={`${bmi.value} (${bmi.label})`} /> : null;
            })()}
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

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Metric icon={<Target size={16} strokeWidth={2.25} />} label="Objetivo" value={student?.objetivo ?? "-"} />
          <Metric icon={<Cake size={16} strokeWidth={2.25} />} label="Edad" value={calcularEdad(student?.fecha_nacimiento ?? null)} />
          <Metric icon={<User size={16} strokeWidth={2.25} />} label="Sexo" value={student?.sexo ?? "-"} />
          <Metric icon={<Calendar size={16} strokeWidth={2.25} />} label="Inicio" value={student?.fecha_inicio ?? "-"} />
          <Metric icon={<Calendar size={16} strokeWidth={2.25} />} label="Nacimiento" value={student?.fecha_nacimiento ?? "-"} />
        </div>

        <ActionForm
          action={updateFullName}
          submitLabel="Guardar nombre"
          fields={[{ name: "full_name", label: "Nombre y apellido", type: "text", defaultValue: profile.full_name }]}
        />

        <details className="mt-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary">
            <User size={16} strokeWidth={2.5} />
            Editar perfil
          </summary>
          <div className="mt-4">
            <ActionForm
              action={updateMyProfile}
              submitLabel="Guardar cambios"
              fields={[
                { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date", required: false, defaultValue: student?.fecha_nacimiento ?? "" },
                { name: "sexo", label: "Sexo", type: "select", required: false, defaultValue: student?.sexo ?? "", options: SEXOS },
                ...(!hasActiveRoutine
                  ? [{ name: "objetivo" as const, label: "Objetivo", type: "select" as const, required: false, defaultValue: student?.objetivo ?? "", options: OBJETIVOS }]
                  : []),
              ]}
            />
            {hasActiveRoutine && (
              <p className="mt-2 text-xs text-text-muted">
                Para cambiar tu objetivo, primero consultá a tu entrenador.
              </p>
            )}
          </div>
        </details>
      </article>

      <article className="glass-card rounded-[2rem] p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <CalendarClock size={14} strokeWidth={2.5} />
          Horarios semanales
        </p>
        {!schedules || schedules.length === 0 ? (
          <p className="text-text-muted">Tu entrenador todavía no cargó horarios.</p>
        ) : (
          <div className="space-y-2">
            {schedules.map((sched: { id: string; dia_semana: number; hora: string }) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={sched.id}>
                <span className="font-bold">{DIAS_SEMANA[sched.dia_semana]}</span>
                <span className="text-text-muted">{sched.hora.slice(0, 5)}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
