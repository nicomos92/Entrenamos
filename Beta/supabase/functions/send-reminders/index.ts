import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4";

interface Appointment {
  id: string;
  scheduled_at: string;
  student: { email: string; full_name: string };
  trainer: { full_name: string };
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
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(`
      id,
      scheduled_at,
      student:profiles!appointments_student_id_fkey(email, full_name),
      trainer:profiles!appointments_trainer_id_fkey(full_name)
    `)
    .in("status", ["pendiente", "confirmado"])
    .gte("scheduled_at", now.toISOString())
    .lt("scheduled_at", inOneHour.toISOString());

  if (error) {
    console.error("Error fetching appointments:", error);
    return new Response(error.message, { status: 500 });
  }

  let sent = 0;

  for (const appt of appointments as unknown as Appointment[]) {
    if (!appt.student?.email) continue;

    const dateStr = new Date(appt.scheduled_at).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      await resend.emails.send({
        from: "Entrenamos <recordatorios@entrenamos.app>",
        to: appt.student.email,
        subject: "Recordatorio de turno",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2>Hola ${appt.student.full_name}!</h2>
            <p>Te recordamos que tenés un turno con <strong>${appt.trainer.full_name}</strong>:</p>
            <p style="font-size:1.25rem;font-weight:bold">${dateStr}</p>
            <p>¡No faltes!</p>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      console.error(`Error sending reminder for ${appt.id}:`, err);
    }
  }

  console.log(`Sent ${sent} reminders`);
  return new Response(JSON.stringify({ sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
