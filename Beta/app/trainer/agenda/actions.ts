"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createAppointment(formData: FormData) {
  const studentId = String(formData.get("student_id") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const timezoneOffsetMinutes = parseInt(String(formData.get("timezone_offset_minutes") ?? "0"), 10);

  if (!studentId || !date || !time) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Parse datetime as local time, then convert to UTC by adjusting for the client's timezone offset
  const localDate = new Date(`${date}T${time}:00`);
  const utcDate = new Date(localDate.getTime() + timezoneOffsetMinutes * 60 * 1000);
  const scheduledAt = utcDate.toISOString();

  await supabase.from("appointments").insert({
    trainer_id: user.id,
    student_id: studentId,
    scheduled_at: scheduledAt,
    notes,
  });

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "pendiente" | "confirmado" | "cancelado" | "completado"
) {
  const supabase = await createClient();
  await supabase.from("appointments").update({ status }).eq("id", appointmentId);
  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}

export async function deleteAppointment(appointmentId: string) {
  const supabase = await createClient();
  await supabase.from("appointments").delete().eq("id", appointmentId);
  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}
