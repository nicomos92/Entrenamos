"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function cancelStudentAppointment(appointmentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: appt } = await supabase
    .from("appointments")
    .select("trainer_id, scheduled_at")
    .eq("id", appointmentId)
    .single();

  await supabase
    .from("appointments")
    .update({ status: "cancelado" })
    .eq("id", appointmentId)
    .eq("student_id", user.id);

  if (appt) {
    const { data: studentProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const dateStr = new Date(appt.scheduled_at).toLocaleDateString("es-AR", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    });

    await createNotification({
      userId: appt.trainer_id,
      type: "appointment_cancelled",
      title: "Turno cancelado por el alumno",
      body: `${studentProfile?.full_name ?? "Un alumno"} canceló el turno del ${dateStr}.`,
      data: { appointmentId },
    });
  }

  revalidatePath("/student/agenda");
}
