import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Scale, History, ClipboardPlus, Target, User, Cake, Calendar, CalendarClock, CalendarPlus, DollarSign, CreditCard } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getRoutines } from "@/lib/data/trainer";
import { getBodyMetrics, buildTrend } from "@/lib/data/bodyMetrics";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { Metric } from "@/app/components/shared/Metric";
import { TrendSparkline } from "@/app/components/shared/TrendSparkline";
import { ActionForm } from "@/app/components/shared/ActionForm";
import { StudentDetailActions } from "@/app/trainer/students/[id]/StudentDetailActions";
import { StudentAppointments } from "@/app/trainer/students/[id]/StudentAppointments";
import { logMetricForStudent, updateStudentProfile, saveFeeConfig, registerPayment } from "@/app/trainer/students/actions";
import { DIAS_SEMANA } from "@/lib/supabase/database.types";
import type { StudentSchedule } from "@/lib/supabase/database.types";
import { ScheduleEditor } from "@/app/trainer/students/[id]/ScheduleEditor";

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

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireProfile("trainer");

  const { data: student } = await supabase
    .from("students")
    .select("profile_id, status, note, fee_amount, fee_due_day")
    .eq("profile_id", id)
    .eq("trainer_id", user.id)
    .single();

  if (!student) notFound();

  const [{ data: profile }, routines, { data: assignment }, { data: sessions }, metrics, { data: appointments }, { data: payments }] = await Promise.all([
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
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, notes, duration_minutes")
      .eq("student_id", id)
      .eq("trainer_id", user.id)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("payments")
      .select("id, amount, period_month, paid_at, notes")
      .eq("student_id", id)
      .order("period_month", { ascending: false }),
  ]);

  async function safeSingle<T>(q: PromiseLike<{ data: T | null }>) {
    try { const r = await q; return r.data; } catch { return null; }
  }
  async function safeMany<T>(q: PromiseLike<{ data: T[] | null }>) {
    try { const r = await q; return r.data ?? []; } catch { return []; }
  }

  const [profileExtra, schedulesResult] = await Promise.all([
    safeSingle<{ objetivo: string | null; fecha_inicio: string | null; fecha_nacimiento: string | null; sexo: string | null }>(
      supabase
        .from("students")
        .select("objetivo, fecha_inicio, fecha_nacimiento, sexo")
        .eq("profile_id", id)
        .eq("trainer_id", user.id)
        .single()
    ),
    safeMany<{ id: string; dia_semana: number; hora: string }>(
      supabase
        .from("student_schedules")
        .select("*")
        .eq("student_id", id)
        .order("dia_semana", { ascending: true })
    ),
  ]);

  const weightTrend = buildTrend(metrics, "weightKg");
  const latestMetric = metrics[0];
  const boundLogMetric = logMetricForStudent.bind(null, id);
  const boundUpdateProfile = updateStudentProfile.bind(null, id);
  const boundSaveFee = saveFeeConfig.bind(null, id);
  const boundRegisterPayment = registerPayment.bind(null, id);
  const schedules = schedulesResult as StudentSchedule[];
  const extra = profileExtra;

  const calcularEdad = (fecha: string | null): string => {
    if (!fecha) return "-";
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return `${edad} años`;
  };

  const bmiResult = latestMetric?.weightKg && latestMetric?.heightCm
    ? calcularBMI(latestMetric.weightKg, latestMetric.heightCm)
    : null;

  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  const paidThisMonth = payments?.some((p) => p.period_month === currentMonth);

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
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <User size={14} strokeWidth={2.5} />
          Perfil del alumno
        </p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Metric icon={<Target size={16} strokeWidth={2.25} />} label="Objetivo" value={extra?.objetivo ?? "-"} />
          <Metric icon={<Cake size={16} strokeWidth={2.25} />} label="Edad" value={calcularEdad(extra?.fecha_nacimiento ?? null)} />
          <Metric icon={<User size={16} strokeWidth={2.25} />} label="Sexo" value={extra?.sexo ?? "-"} />
          <Metric icon={<Calendar size={16} strokeWidth={2.25} />} label="Inicio" value={extra?.fecha_inicio ?? "-"} />
          <Metric icon={<Calendar size={16} strokeWidth={2.25} />} label="Nacimiento" value={extra?.fecha_nacimiento ?? "-"} />
        </div>

        <details>
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary">
            <User size={16} strokeWidth={2.5} />
            Editar perfil
          </summary>
          <div className="mt-4">
            <ActionForm
              action={boundUpdateProfile}
              submitLabel="Guardar cambios"
              fields={[
                { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date", required: false, defaultValue: extra?.fecha_nacimiento ?? "" },
                { name: "sexo", label: "Sexo", type: "select", required: false, defaultValue: extra?.sexo ?? "", options: SEXOS },
                { name: "objetivo", label: "Objetivo", type: "select", required: false, defaultValue: extra?.objetivo ?? "", options: OBJETIVOS },
                { name: "fecha_inicio", label: "Fecha de inicio", type: "date", required: false, defaultValue: extra?.fecha_inicio ?? "" },
              ]}
            />
          </div>
        </details>
      </article>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <CalendarClock size={14} strokeWidth={2.5} />
          Horarios semanales
        </p>

        {schedules.length === 0 ? (
          <p className="mb-4 text-text-muted">Todavía no hay horarios cargados.</p>
        ) : (
          <div className="mb-4 space-y-2">
            {schedules.map((sched) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={sched.id}>
                <span className="font-bold">{DIAS_SEMANA[sched.dia_semana]}</span>
                <span className="text-text-muted">{sched.hora.slice(0, 5)}</span>
              </div>
            ))}
          </div>
        )}

        <ScheduleEditor studentId={id} schedules={schedules} />
      </article>

      <article className="glass-card rounded-3xl p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <CalendarPlus size={14} strokeWidth={2.5} />
          Turnos
        </p>
        <StudentAppointments appointments={appointments ?? []} studentId={id} />
      </article>

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
            <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="Peso" value={latestMetric.weightKg != null ? `${latestMetric.weightKg} kg` : "-"} />
            <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="Altura" value={latestMetric.heightCm != null ? `${latestMetric.heightCm} cm` : "-"} />
            <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="Grasa corporal" value={latestMetric.bodyFatPct != null ? `${latestMetric.bodyFatPct}%` : "-"} />
            <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="Masa muscular" value={latestMetric.muscleMassKg != null ? `${latestMetric.muscleMassKg} kg` : "-"} />
            {bmiResult && (
              <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="IMC" value={`${bmiResult.value} (${bmiResult.label})`} />
            )}
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
          <DollarSign size={14} strokeWidth={2.5} />
          Cuota
        </p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Metric icon={<DollarSign size={16} strokeWidth={2.25} />} label="Monto" value={student.fee_amount != null ? `$${student.fee_amount}` : "Sin configurar"} />
          <Metric icon={<Calendar size={16} strokeWidth={2.25} />} label="Día de vencimiento" value={student.fee_due_day != null ? `Día ${student.fee_due_day}` : "Sin configurar"} />
          <Metric icon={<CreditCard size={16} strokeWidth={2.25} />} label="Este mes" value={paidThisMonth ? "Pagado" : "Pendiente"} />
        </div>

        <details>
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary">
            <DollarSign size={16} strokeWidth={2.5} />
            Configurar cuota
          </summary>
          <div className="mt-4">
            <ActionForm
              action={boundSaveFee}
              submitLabel="Guardar cuota"
              fields={[
                { name: "fee_amount", label: "Monto de la cuota ($)", type: "number", required: false, defaultValue: student.fee_amount != null ? String(student.fee_amount) : "" },
                { name: "fee_due_day", label: "Día de vencimiento (1-31)", type: "number", required: false, defaultValue: student.fee_due_day != null ? String(student.fee_due_day) : "10" },
              ]}
            />
          </div>
        </details>

        <details className="mt-3">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary">
            <CreditCard size={16} strokeWidth={2.5} />
            Registrar pago
          </summary>
          <div className="mt-4">
            <ActionForm
              action={boundRegisterPayment}
              submitLabel="Registrar pago"
              fields={[
                { name: "amount", label: "Monto pagado ($)", type: "number", required: true, defaultValue: student.fee_amount != null ? String(student.fee_amount) : "" },
                { name: "period_month", label: "Período (ej: 2026-07)", type: "month", required: true, defaultValue: new Date().toISOString().slice(0, 7) },
                { name: "notes", label: "Notas (opcional)", type: "text", required: false },
              ]}
            />
          </div>
        </details>

        {payments && payments.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Historial de pagos</p>
            {payments.slice(0, 12).map((p) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={p.id}>
                <div>
                  <span className="font-bold">${p.amount}</span>
                  <span className="ml-2 text-text-muted">{p.period_month}</span>
                  {p.notes && <span className="ml-2 text-xs text-text-muted">· {p.notes}</span>}
                </div>
                <span className="text-xs text-text-muted">{new Date(p.paid_at).toLocaleDateString("es-AR")}</span>
              </div>
            ))}
          </div>
        )}
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
