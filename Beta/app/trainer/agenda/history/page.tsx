import Link from "next/link";
import { ArrowLeft, History, CalendarX } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SectionHeader } from "@/app/components/shared/SectionHeader";
import { AppointmentStatusSelect } from "@/app/trainer/agenda/AppointmentStatusSelect";

export default async function AgendaHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; month?: string }>;
}) {
  const { supabase, user } = await requireProfile("trainer");
  const params = await searchParams;

  const now = new Date().toISOString();

  let query = supabase
    .from("appointments")
    .select("id, student_id, scheduled_at, status, notes, duration_minutes")
    .eq("trainer_id", user.id)
    .lt("scheduled_at", now)
    .order("scheduled_at", { ascending: false });

  if (params.student) {
    query = query.eq("student_id", params.student);
  }

  if (params.month) {
    const [yr, mo] = params.month.split("-").map(Number);
    const start = new Date(Date.UTC(yr, mo - 1, 1)).toISOString();
    const end = new Date(Date.UTC(yr, mo, 0, 23, 59, 59)).toISOString();
    query = query.gte("scheduled_at", start).lte("scheduled_at", end);
  }

  const [appointmentsData, studentsData] = await Promise.all([
    query,
    supabase.from("students").select("profile_id, profiles(full_name)").eq("trainer_id", user.id),
  ]);

  const appointments = appointmentsData.data ?? [];
  const studentList = (studentsData.data ?? []).map((s) => ({
    id: s.profile_id,
    name: (s.profiles as unknown as { full_name: string } | null)?.full_name ?? "Alumno",
  }));

  const nameMap = new Map(studentList.map((s) => [s.id, s.name]));

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  });

  const selectedMonth = params.month ?? now.slice(0, 7);

  return (
    <section className="space-y-5">
      <div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary" href="/trainer/agenda">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Agenda
        </Link>
      </div>

      <SectionHeader eyebrow="Turnos pasados" icon={<History size={20} strokeWidth={2.25} />} title="Historial" />

      <div className="flex gap-2">
        <select
          className="field-input rounded-2xl py-2.5 text-sm"
          defaultValue={selectedMonth}
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set("month", e.target.value);
            window.location.href = url.toString();
          }}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {new Date(m + "-01").toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>

        <select
          className="field-input rounded-2xl py-2.5 text-sm"
          defaultValue={params.student ?? ""}
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value) url.searchParams.set("student", e.target.value);
            else url.searchParams.delete("student");
            window.location.href = url.toString();
          }}
        >
          <option value="">Todos los alumnos</option>
          {studentList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {appointments.length === 0 ? (
        <EmptyState description="No hay turnos pasados para esa selección." icon={<CalendarX size={26} strokeWidth={2.25} />} title="Sin historial" />
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <article className="glass-card rounded-3xl p-4" key={appt.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{nameMap.get(appt.student_id) ?? "Alumno"}</p>
                  <p className="text-sm text-text-muted">
                    {new Date(appt.scheduled_at).toLocaleString("es-AR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {appt.notes && <p className="mt-1 text-sm text-text-muted">{appt.notes}</p>}
                </div>
                <AppointmentStatusSelect id={appt.id} status={appt.status as any} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
