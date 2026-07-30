"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import type { FormState } from "@/lib/types/form";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function getNextDayOfWeek(diaSemana: number, time: string, tzOffset: number): Date {
  const utcNow = new Date();
  const localNow = new Date(utcNow.getTime() - tzOffset * 60 * 1000);
  const target = new Date(localNow);
  const currentDay = localNow.getDay();
  let diff = diaSemana - currentDay;
  const [hr, mi] = time.split(":").map(Number);

  target.setHours(hr, mi, 0, 0);

  if (diff < 0) {
    diff += 7;
    target.setDate(localNow.getDate() + diff);
  } else if (diff > 0) {
    target.setDate(localNow.getDate() + diff);
  }
  // diff === 0: mismo día — si la hora ya pasó, ir a la próxima semana
  if (diff === 0 && target.getTime() <= localNow.getTime()) {
    target.setDate(target.getDate() + 7);
  }

  return target;
}

function getScheduledAt(date: string, time: string, tzOffset: number): Date {
  const [yr, mo, dy] = date.split("-").map(Number);
  const [hr, mi] = time.split(":").map(Number);
  return new Date(Date.UTC(yr, mo - 1, dy, hr, mi) + tzOffset * 60 * 1000);
}

function getRecurringDates(dateStr: string, rule: string, maxWeeks = 8): string[] {
  if (!rule || rule === "none") return [dateStr];
  const dates: string[] = [dateStr];
  const base = new Date(dateStr);
  const intervalDays = rule === "weekly" ? 7 : 14;
  for (let i = 1; i < maxWeeks; i++) {
    const next = new Date(base);
    next.setDate(next.getDate() + i * intervalDays);
    dates.push(next.toISOString().slice(0, 10));
  }
  return dates;
}

export async function createAppointment(_prevState: FormState, formData: FormData): Promise<FormState> {
  const studentId = String(formData.get("student_id") ?? "");
  const date = String(formData.get("date") ?? "");
  const diaSemanaRaw = String(formData.get("dia_semana") ?? "");
  const time = String(formData.get("time") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const durationRaw = String(formData.get("duration_minutes") ?? "60").trim();
  const durationMinutes = Math.max(15, parseInt(durationRaw, 10) || 60);
  const timezoneOffsetMinutes = parseInt(String(formData.get("timezone_offset_minutes") ?? "0"), 10);

  if (!studentId || !time) return { error: "Completa alumno, día y hora." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Si se envía dia_semana calcular próxima fecha, sino usar date (backwards compat)
  const scheduledAt = diaSemanaRaw
    ? getNextDayOfWeek(parseInt(diaSemanaRaw, 10), time, timezoneOffsetMinutes)
    : date
      ? getScheduledAt(date, time, timezoneOffsetMinutes)
      : null;

  if (!scheduledAt) return { error: "Completa día y hora." };

  // Generar 8 semanas de turnos
  const inserts = [];
  const recurringGroupId = crypto.randomUUID();
  for (let i = 0; i < 8; i++) {
    const weekDate = new Date(scheduledAt);
    weekDate.setDate(weekDate.getDate() + i * 7);
    inserts.push({
      trainer_id: user.id,
      student_id: studentId,
      scheduled_at: weekDate.toISOString(),
      notes: i === 0 ? notes : "",
      duration_minutes: durationMinutes,
      recurring_group_id: recurringGroupId,
      recurring_rule: "weekly",
    });
  }

  const { error } = await supabase.from("appointments").insert(inserts);
  if (error) return { error: "No se pudo crear el turno." };

  const { data: trainerProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const scheduledLocal = scheduledAt.toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

  const diaLabel = DIAS[parseInt(diaSemanaRaw, 10)] ?? "";

  await createNotification({
    userId: studentId,
    type: "appointment_created",
    title: `Turno agendado (${inserts.length} sesiones)`,
    body: `${trainerProfile?.full_name ?? "Tu entrenador"} agendó turnos los ${diaLabel} a las ${time} por las próximas 8 semanas.`,
    data: { appointmentId: inserts[0].scheduled_at },
  });

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
  return {
    success: true,
    message: `${inserts.length} turnos agendados (${diaLabel} ${time}).`,
    error: null,
  };
}

export async function updateAppointment(_prevState: FormState, formData: FormData): Promise<FormState> {
  const appointmentId = String(formData.get("appointment_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const durationRaw = String(formData.get("duration_minutes") ?? "60").trim();
  const durationMinutes = Math.max(15, parseInt(durationRaw, 10) || 60);
  const timezoneOffsetMinutes = parseInt(String(formData.get("timezone_offset_minutes") ?? "0"), 10);
  const applySeries = formData.get("apply_series") === "true";

  if (!appointmentId || !studentId || !date || !time) return { error: "Completa todos los campos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scheduledAt = getScheduledAt(date, time, timezoneOffsetMinutes);

  const { data: existing } = await supabase
    .from("appointments")
    .select("recurring_group_id")
    .eq("id", appointmentId)
    .single();

  if (existing?.recurring_group_id && applySeries) {
    const deltaMs = scheduledAt.getTime() - new Date(date + "T" + time).getTime();
    const { data: series } = await supabase
      .from("appointments")
      .select("id, scheduled_at")
      .eq("recurring_group_id", existing.recurring_group_id);

    for (const s of series ?? []) {
      const oldDate = new Date(s.scheduled_at);
      await supabase
        .from("appointments")
        .update({
          scheduled_at: new Date(oldDate.getTime() + deltaMs).toISOString(),
          duration_minutes: durationMinutes,
          notes,
        })
        .eq("id", s.id);
    }
  } else {
    const { error } = await supabase
      .from("appointments")
      .update({ scheduled_at: scheduledAt.toISOString(), notes, duration_minutes: durationMinutes })
      .eq("id", appointmentId);

    if (error) return { error: "No se pudo actualizar el turno." };
  }

  const { data: trainerProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const scheduledLocal = scheduledAt.toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

  await createNotification({
    userId: studentId,
    type: "appointment_updated",
    title: "Turno actualizado",
    body: `${trainerProfile?.full_name ?? "Tu entrenador"} modificó un turno. Nueva fecha: ${scheduledLocal}.`,
    data: { appointmentId },
  });

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
  return { success: true, message: "Turno actualizado.", error: null };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "pendiente" | "confirmado" | "cancelado" | "completado"
) {
  const supabase = await createClient();
  const { data: appt } = await supabase
    .from("appointments")
    .select("student_id")
    .eq("id", appointmentId)
    .single();

  await supabase.from("appointments").update({ status }).eq("id", appointmentId);

  if (appt && (status === "cancelado" || status === "completado")) {
    const { data: trainerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", appt.student_id)
      .single();

    await createNotification({
      userId: appt.student_id,
      type: status === "cancelado" ? "appointment_cancelled" : "appointment_updated",
      title: status === "cancelado" ? "Turno cancelado" : "Turno completado",
      body: `Tu turno fue marcado como "${status}" por el entrenador.`,
      data: { appointmentId },
    });
  }

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}

export async function deleteAppointment(appointmentId: string) {
  const supabase = await createClient();
  const { data: appt } = await supabase
    .from("appointments")
    .select("student_id, scheduled_at")
    .eq("id", appointmentId)
    .single();

  await supabase.from("appointments").delete().eq("id", appointmentId);

  if (appt) {
    const dateStr = new Date(appt.scheduled_at).toLocaleDateString("es-AR", {
      weekday: "long", day: "numeric", month: "long",
    });
    await createNotification({
      userId: appt.student_id,
      type: "appointment_cancelled",
      title: "Turno eliminado",
      body: `El turno del ${dateStr} fue eliminado por el entrenador.`,
      data: { appointmentId },
    });
  }

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}

export async function deleteRecurringSeries(groupId: string) {
  const supabase = await createClient();
  await supabase.from("appointments").delete().eq("recurring_group_id", groupId);
  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}

export async function cancelRecurringSeries(groupId: string, futureOnly = true) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  let query = supabase.from("appointments").update({ status: "cancelado" }).eq("recurring_group_id", groupId);
  if (futureOnly) {
    query = query.gte("scheduled_at", now);
  }
  await query;
  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}

export async function rescheduleAppointment(appointmentId: string, newScheduledAt: string) {
  const supabase = await createClient();
  const { data: appt } = await supabase
    .from("appointments")
    .select("student_id, duration_minutes")
    .eq("id", appointmentId)
    .single();

  if (!appt) throw new Error("Turno no encontrado");

  const newDate = new Date(newScheduledAt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  await supabase.from("appointments").update({ scheduled_at: newScheduledAt }).eq("id", appointmentId);

  await createNotification({
    userId: appt.student_id,
    type: "appointment_updated",
    title: "Turno reprogramado",
    body: `Tu turno fue reprogramado para el ${newDate.toLocaleDateString("es-AR", {
      weekday: "long", day: "numeric", month: "long",
      hour: "2-digit", minute: "2-digit",
    })}.`,
    data: { appointmentId },
  });

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}
