"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import type { FormState } from "@/lib/types/form";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function parseDiaSemana(value: FormDataEntryValue | null): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
}

function normalizeHora(value: FormDataEntryValue | null): string | null {
  const hora = String(value ?? "").trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora) ? hora : null;
}

export async function addScheduleEntry(_prevState: FormState, formData: FormData): Promise<FormState> {
  const studentId = String(formData.get("student_id") ?? "").trim();
  const diaSemana = parseDiaSemana(formData.get("dia_semana"));
  const hora = normalizeHora(formData.get("time"));

  if (!studentId || diaSemana == null || !hora) {
    return { error: "Completá alumno, día y hora." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("student_schedules").insert({
    student_id: studentId,
    dia_semana: diaSemana,
    hora,
  });

  if (error) return { error: "No se pudo agregar el horario." };

  const { data: trainerProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  await createNotification({
    userId: studentId,
    type: "schedule_updated",
    title: "Nuevo horario",
    body: `${trainerProfile?.full_name ?? "Tu entrenador"} agregó un horario: ${DIAS[diaSemana]} a las ${hora}.`,
  });

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
  return { success: true, message: `Horario agregado: ${DIAS[diaSemana]} ${hora}.`, error: null };
}

export async function updateScheduleEntry(
  scheduleId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const diaSemana = parseDiaSemana(formData.get("dia_semana"));
  const hora = normalizeHora(formData.get("time"));

  if (diaSemana == null || !hora) {
    return { error: "Completá día y hora." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("student_schedules")
    .select("student_id")
    .eq("id", scheduleId)
    .single();

  const { error } = await supabase
    .from("student_schedules")
    .update({ dia_semana: diaSemana, hora })
    .eq("id", scheduleId);

  if (error) return { error: "No se pudo actualizar el horario." };

  if (existing) {
    const { data: trainerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    await createNotification({
      userId: existing.student_id,
      type: "schedule_updated",
      title: "Horario actualizado",
      body: `${trainerProfile?.full_name ?? "Tu entrenador"} cambió un horario: ${DIAS[diaSemana]} a las ${hora}.`,
    });
  }

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
  return { success: true, message: "Horario actualizado.", error: null };
}

export async function moveScheduleEntry(scheduleId: string, diaSemana: number, hora: string) {
  if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) return;
  const normalized = normalizeHora(hora);
  if (!normalized) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("student_schedules")
    .select("student_id")
    .eq("id", scheduleId)
    .single();

  await supabase
    .from("student_schedules")
    .update({ dia_semana: diaSemana, hora: normalized })
    .eq("id", scheduleId);

  if (existing) {
    const { data: trainerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    await createNotification({
      userId: existing.student_id,
      type: "schedule_updated",
      title: "Horario movido",
      body: `${trainerProfile?.full_name ?? "Tu entrenador"} movió un horario a ${DIAS[diaSemana]} a las ${normalized}.`,
    });
  }

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}

export async function deleteScheduleEntry(scheduleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("student_schedules")
    .select("student_id, dia_semana, hora")
    .eq("id", scheduleId)
    .single();

  await supabase.from("student_schedules").delete().eq("id", scheduleId);

  if (existing) {
    const { data: trainerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    await createNotification({
      userId: existing.student_id,
      type: "schedule_updated",
      title: "Horario eliminado",
      body: `${trainerProfile?.full_name ?? "Tu entrenador"} eliminó el horario de ${DIAS[existing.dia_semana]} a las ${existing.hora.slice(0, 5)}.`,
    });
  }

  revalidatePath("/trainer/agenda");
  revalidatePath("/trainer");
}
