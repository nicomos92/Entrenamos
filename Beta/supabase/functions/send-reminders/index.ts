import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4";

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

interface ScheduleRow {
  id: string;
  student_id: string;
  dia_semana: number;
  hora: string;
}

interface StudentRow {
  profile_id: string;
  trainer_id: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string;
  email_for_reminders: string | null;
  reminder_lead_minutes: number | null;
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.error("RESEND_API_KEY not set — skipping reminders");
    return new Response("RESEND_API_KEY not configured", { status: 200 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendApiKey);

  const now = new Date();
  const today = now.getDay();

  const { data: schedules, error } = await supabase
    .from("student_schedules")
    .select("id, student_id, dia_semana, hora");

  if (error) {
    console.error("Error fetching schedules:", error);
    return new Response(error.message, { status: 500 });
  }

  if (!schedules || schedules.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { "Content-Type": "application/json" } });
  }

  const studentIds = [...new Set(schedules.map((s) => s.student_id))];

  const { data: students } = await supabase
    .from("students")
    .select("profile_id, trainer_id")
    .in("profile_id", studentIds);

  const profileIds = [...new Set([...studentIds, ...(students ?? []).map((s) => s.trainer_id)])];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, email_for_reminders, reminder_lead_minutes")
    .in("id", profileIds);

  const studentMap = new Map((students ?? []).map((s) => [s.profile_id, s]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  let sent = 0;

  for (const sched of (schedules as ScheduleRow[])) {
    if (sched.dia_semana !== today) continue;

    const student = studentMap.get(sched.student_id) as StudentRow | undefined;
    const studentProfile = profileMap.get(sched.student_id) as ProfileRow | undefined;
    if (!student || !studentProfile) continue;

    const trainer = profileMap.get(student.trainer_id) as ProfileRow | undefined;
    const leadMinutes = studentProfile.reminder_lead_minutes ?? 60;

    const [hr, mi] = sched.hora.split(":").map(Number);
    const slot = new Date(now);
    slot.setHours(hr, mi, 0, 0);
    const diffMin = (slot.getTime() - now.getTime()) / 60000;

    // Enviar ~leadMinutes antes del turno (ventana de ±10 min para crons horarios)
    if (diffMin < leadMinutes - 10 || diffMin > leadMinutes + 10) continue;

    const to = studentProfile.email_for_reminders || studentProfile.email;
    if (!to) continue;

    const dateStr = `${DIAS[sched.dia_semana]} a las ${sched.hora.slice(0, 5)}`;

    try {
      await resend.emails.send({
        from: "Entrenamos <recordatorios@entrenamos.app>",
        to,
        subject: "Recordatorio de tu entrenamiento",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2>Hola ${studentProfile.full_name}!</h2>
            <p>Te recordamos que tenés tu horario de entrenamiento con <strong>${trainer?.full_name ?? "tu entrenador"}</strong>:</p>
            <p style="font-size:1.25rem;font-weight:bold">${dateStr}</p>
            <p>Duración aproximada: 60 minutos.</p>
            <p>¡Nos vemos!</p>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      console.error(`Error sending reminder for schedule ${sched.id}:`, err);
    }
  }

  console.log(`Sent ${sent} reminders`);
  return new Response(JSON.stringify({ sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
