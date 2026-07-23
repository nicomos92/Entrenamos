import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Scale, History, ClipboardPlus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getRoutines } from "@/lib/data/trainer";
import { getBodyMetrics, buildTrend } from "@/lib/data/bodyMetrics";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { Metric } from "@/app/components/shared/Metric";
import { TrendSparkline } from "@/app/components/shared/TrendSparkline";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { StudentDetailActions } from "@/app/trainer/students/[id]/StudentDetailActions";
import { logMetricForStudent } from "@/app/trainer/students/actions";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireProfile("trainer");

  const { data: student } = await supabase
    .from("students")
    .select("profile_id, status, note")
    .eq("profile_id", id)
    .eq("trainer_id", user.id)
    .single();

  if (!student) notFound();

  const [{ data: profile }, routines, { data: assignment }, { data: sessions }, metrics] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", id).single(),
    getRoutines(supabase, user.id),
    supabase
      .from("assignments")
      .select("routine_id")
      .eq("student_id", id)
      .eq("active", true)
      .maybeSingle(),
    supabase
      .from("sessions")
      .select("id, effort, elapsed_minutes, status, created_at, routines(name)")
      .eq("student_id", id)
      .order("created_at", { ascending: false })
      .limit(5),
    getBodyMetrics(supabase, id),
  ]);

  const weightTrend = buildTrend(metrics, "weightKg");
  const latestMetric = metrics[0];
  const boundLogMetric = logMetricForStudent.bind(null, id);

  return (
    <section className="space-y-5">
      <div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary" href="/trainer/students">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Alumnos
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">{profile?.full_name}</h1>
          <StatusBadge status={student.status} />
        </div>
        <p className="text-text-muted">{profile?.email}</p>
      </div>

      <StudentDetailActions
        currentRoutineId={assignment?.routine_id ?? null}
        initialNote={student.note}
        routines={routines.map((r) => ({ id: r.id, name: r.name }))}
        status={student.status}
        studentId={id}
      />

      <article className="glass-card rounded-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
            <Scale size={14} strokeWidth={2.5} />
            Composición corporal
          </p>
          {weightTrend.deltaFromFirst != null && (
            <span className="text-sm font-bold text-primary">
              {weightTrend.deltaFromFirst > 0 ? "+" : ""}
              {weightTrend.deltaFromFirst} kg
            </span>
          )}
        </div>

        {latestMetric ? (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Metric icon={Scale} label="Peso" value={latestMetric.weightKg != null ? `${latestMetric.weightKg} kg` : "-"} />
            <Metric icon={Scale} label="Altura" value={latestMetric.heightCm != null ? `${latestMetric.heightCm} cm` : "-"} />
            <Metric icon={Scale} label="Grasa corporal" value={latestMetric.bodyFatPct != null ? `${latestMetric.bodyFatPct}%` : "-"} />
            <Metric icon={Scale} label="Masa muscular" value={latestMetric.muscleMassKg != null ? `${latestMetric.muscleMassKg} kg` : "-"} />
          </div>
        ) : (
          <p className="mb-4 text-text-muted">Todavía no hay mediciones registradas.</p>
        )}

        {weightTrend.points.length >= 2 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Peso a lo largo del tiempo</p>
            <TrendSparkline points={weightTrend.points} />
          </div>
        )}

        <details>
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary">
            <ClipboardPlus size={16} strokeWidth={2.5} />
            Cargar una medición
          </summary>
          <div className="mt-4">
            <ActionForm
              action={boundLogMetric}
              submitLabel="Guardar medición"
              fields={[
                { name: "weight_kg", label: "Peso (kg)", type: "number", required: false },
                { name: "height_cm", label: "Altura (cm)", type: "number", required: false },
                { name: "body_fat_pct", label: "Grasa corporal (%)", type: "number", required: false },
                { name: "muscle_mass_kg", label: "Masa muscular (kg)", type: "number", required: false },
                { name: "notes", label: "Notas (opcional)", type: "textarea", required: false },
              ]}
            />
          </div>
        </details>
      </article>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <History size={14} strokeWidth={2.5} />
          Últimas sesiones
        </p>
        {!sessions || sessions.length === 0 ? (
          <p className="text-text-muted">Todavía no registró entrenamientos.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={session.id}>
                <div>
                  <p className="font-bold">{(session.routines as unknown as { name: string } | null)?.name ?? "Rutina"}</p>
                  <p className="text-text-muted">{new Date(session.created_at).toLocaleDateString("es-AR")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{session.status}</p>
                  <p className="text-text-muted">RPE {session.effort ?? "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
