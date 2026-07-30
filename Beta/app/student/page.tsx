import Link from "next/link";
import { Target, ListChecks, Flame, Play, History, CalendarClock, Scale, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getActiveAssignment, getWeeklyProgress } from "@/lib/data/student";
import { getBodyMetrics, buildTrend } from "@/lib/data/bodyMetrics";
import { Metric } from "@/app/components/shared/Metric";
import { TrendSparkline } from "@/app/components/shared/TrendSparkline";
import { EmptyState } from "@/app/components/shared/EmptyState";

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

function getFeeStatus(dueDay: number, paidThisMonth: boolean): { label: string; className: string } {
  if (paidThisMonth) return { label: "Al día", className: "text-status-active" };
  const today = new Date();
  const todayDay = today.getDate();
  const daysUntilDue = dueDay >= todayDay ? dueDay - todayDay : dueDay + (new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - todayDay);
  if (daysUntilDue <= 0) return { label: "Vencido", className: "text-status-urgent" };
  if (daysUntilDue <= 7) return { label: "Próximo a vencer", className: "text-yellow-500" };
  return { label: "Al día", className: "text-status-active" };
}

export default async function StudentHomePage() {
  const { supabase, user, profile } = await requireProfile("student");

  const [assignment, weeklyProgress, recentSessions, appointmentsData, metrics, studentData, paymentsData] = await Promise.all([
    getActiveAssignment(supabase, user.id),
    getWeeklyProgress(supabase, user.id),
    supabase
      .from("sessions")
      .select("id, effort, elapsed_minutes, status, created_at, routines(name)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("appointments")
      .select("id, scheduled_at, status, notes")
      .eq("student_id", user.id)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(3),
    getBodyMetrics(supabase, user.id),
    supabase
      .from("students")
      .select("fee_amount, fee_due_day")
      .eq("profile_id", user.id)
      .single(),
    supabase
      .from("payments")
      .select("period_month")
      .eq("student_id", user.id)
      .order("period_month", { ascending: false }),
  ]);

  const sessions = recentSessions.data ?? [];
  const appointments = appointmentsData.data ?? [];
  const weightTrend = buildTrend(metrics, "weightKg");
  const latestMetric = metrics[0];

  const studentFee = studentData.data;
  const paymentsList = paymentsData.data ?? [];
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  const paidThisMonth = paymentsList.some((p) => p.period_month === currentMonth);

  const bmiResult = latestMetric?.weightKg && latestMetric?.heightCm
    ? calcularBMI(latestMetric.weightKg, latestMetric.heightCm)
    : null;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-text-muted">Hola, {profile.full_name.split(" ")[0]}. Tu programación está lista.</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-text-primary">¿Qué toca hoy?</h1>
      </div>

      {!assignment ? (
        <EmptyState
          description="Tu entrenador te va a asignar una pronto."
          icon={<ListChecks size={26} strokeWidth={2.25} />}
          title="Todavía no tenés una rutina asignada"
        />
      ) : (
        <article className="glass-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="rounded-full bg-soft px-4 py-2 text-sm font-bold text-primary">Entrenamiento central</span>
            <span className="font-bold text-primary">{assignment.estimatedMinutes} min</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight text-primary">Rutina del día: {assignment.name}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric icon={<Target size={16} strokeWidth={2.25} />} label="Objetivo" value={assignment.goal || "General"} />
            <Metric icon={<ListChecks size={16} strokeWidth={2.25} />} label="Ejercicios" value={`${assignment.exercises.length}`} />
          </div>
          <Link className="premium-button mt-6 w-full" href="/student/workout">
            <Play size={18} strokeWidth={2.5} />
            Iniciar entrenamiento
          </Link>
        </article>
      )}

      <article className="glass-card rounded-[1.75rem] p-6">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-text-primary">
            <Flame size={14} strokeWidth={2.5} />
            Objetivo semanal
          </p>
          <p className="text-2xl font-semibold text-primary">
            {weeklyProgress.done}/{weeklyProgress.goal}
          </p>
        </div>
        <div className="mt-5 h-3 rounded-full bg-surface">
          <div className="h-full rounded-full bg-secondary" style={{ width: `${weeklyProgress.percentage}%` }} />
        </div>
        <p className="mt-4 text-sm text-text-muted">
          {weeklyProgress.done >= weeklyProgress.goal
            ? "¡Cumpliste tu meta semanal!"
            : `Estás a ${weeklyProgress.goal - weeklyProgress.done} sesiones de tu meta. Mantené el ritmo.`}
        </p>
      </article>

      {studentFee?.fee_due_day != null && (
        <article className="glass-card rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-text-primary">
              <DollarSign size={14} strokeWidth={2.5} />
              Cuota
            </p>
            <p className={`text-2xl font-semibold ${getFeeStatus(studentFee.fee_due_day, paidThisMonth).className}`}>
              {getFeeStatus(studentFee.fee_due_day, paidThisMonth).label}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric icon={<DollarSign size={16} strokeWidth={2.25} />} label="Monto" value={studentFee.fee_amount != null ? `$${studentFee.fee_amount}` : "-"} />
            <Metric icon={<CreditCard size={16} strokeWidth={2.25} />} label="Vence el día" value={String(studentFee.fee_due_day)} />
          </div>
          {paidThisMonth ? (
            <p className="mt-3 text-sm text-status-active">Ya pagaste este mes. ¡Gracias!</p>
          ) : (
            <p className="mt-3 text-sm text-text-muted">Recordá abonar antes del día {studentFee.fee_due_day}.</p>
          )}
        </article>
      )}

      <article className="glass-card rounded-[1.75rem] p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-text-primary">
            <Scale size={14} strokeWidth={2.5} />
            Peso corporal
          </p>
          {weightTrend.deltaFromFirst != null && (
            <span className="text-sm font-bold text-primary">
              {weightTrend.deltaFromFirst > 0 ? "+" : ""}
              {weightTrend.deltaFromFirst} kg
            </span>
          )}
        </div>
        {latestMetric && (
          <div className="mb-3 grid grid-cols-2 gap-3">
            <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="Peso" value={latestMetric.weightKg != null ? `${latestMetric.weightKg} kg` : "-"} />
            {bmiResult && <Metric icon={<Scale size={16} strokeWidth={2.25} />} label="IMC" value={`${bmiResult.value} (${bmiResult.label})`} />}
          </div>
        )}
        {weightTrend.points.length >= 2 && <TrendSparkline points={weightTrend.points} />}
        {!latestMetric && <p className="text-sm text-text-muted">Todavía no registraste mediciones.</p>}
      </article>

      {appointments.length > 0 && (
        <article className="glass-card rounded-[1.75rem] p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-text-primary">
            <CalendarClock size={14} strokeWidth={2.5} />
            Próximos turnos
          </p>
          <div className="space-y-2">
            {appointments.map((appt) => (
              <div className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm" key={appt.id}>
                <span className="font-bold">
                  {new Date(appt.scheduled_at).toLocaleString("es-AR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-text-muted">{appt.status}</span>
              </div>
            ))}
          </div>
        </article>
      )}

      {sessions.length > 0 && (
        <article className="glass-card rounded-[1.75rem] p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-text-primary">
              <History size={14} strokeWidth={2.5} />
              Últimas sesiones
            </p>
            <Link className="text-sm font-bold text-primary" href="/student/summary">
              Ver todo <ChevronRight size={14} className="inline" strokeWidth={2.5} />
            </Link>
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => {
              const routineName = (session.routines as { name: string } | null)?.name ?? "Rutina";
              return (
                <Link
                  className="flex items-center justify-between rounded-2xl bg-white/30 px-4 py-3 text-sm transition hover:bg-white/50"
                  href={`/student/summary?session=${session.id}`}
                  key={session.id}
                >
                  <div>
                    <span className="font-bold">{routineName}</span>
                    <span className="ml-2 text-text-muted">
                      {new Date(session.created_at).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <span className="text-text-muted">
                    {session.elapsed_minutes ?? "-"} min · {session.effort ?? "-"}/5 RPE
                  </span>
                </Link>
              );
            })}
          </div>
        </article>
      )}
    </section>
  );
}
