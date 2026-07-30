"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FormState } from "@/lib/types/form";

export async function createStudent(_prevState: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const objetivo = String(formData.get("objetivo") ?? "").trim() || null;
  const fechaInicio = String(formData.get("fecha_inicio") ?? "").trim() || null;
  const fechaNacimiento = String(formData.get("fecha_nacimiento") ?? "").trim() || null;
  const sexo = String(formData.get("sexo") ?? "").trim() || null;

  if (!fullName || !email || !password) {
    return { error: "Completa nombre, email y contraseña." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "student", full_name: fullName },
  });

  if (createError || !created.user) {
    return { error: "No se pudo crear el usuario. Puede que el email ya esté registrado." };
  }

  const { error: insertError } = await supabase.from("students").insert({
    profile_id: created.user.id,
    trainer_id: user.id,
    note,
    objetivo,
    fecha_inicio: fechaInicio,
    fecha_nacimiento: fechaNacimiento,
    sexo,
  });

  if (insertError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "El usuario se creó pero no se pudo vincular como alumno. Por favor, reintentá." };
  }

  revalidatePath("/trainer/students");
  redirect("/trainer/students");
}

export async function updateStudentProfile(
  studentId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const objetivo = String(formData.get("objetivo") ?? "").trim() || null;
  const fechaInicio = String(formData.get("fecha_inicio") ?? "").trim() || null;
  const fechaNacimiento = String(formData.get("fecha_nacimiento") ?? "").trim() || null;
  const sexo = String(formData.get("sexo") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ objetivo, fecha_inicio: fechaInicio, fecha_nacimiento: fechaNacimiento, sexo })
    .eq("profile_id", studentId);

  if (error) return { error: "No se pudieron guardar los cambios." };

  revalidatePath(`/trainer/students/${studentId}`);
  revalidatePath("/trainer/students");
  return { error: null };
}

export async function saveStudentSchedules(
  studentId: string,
  schedules: { dia_semana: number; hora: string }[]
) {
  const supabase = await createClient();

  await supabase.from("student_schedules").delete().eq("student_id", studentId);

  if (schedules.length > 0) {
    const { error } = await supabase.from("student_schedules").insert(
      schedules.map((s) => ({
        student_id: studentId,
        dia_semana: s.dia_semana,
        hora: s.hora,
      }))
    );

    if (error) return;
  }

  revalidatePath(`/trainer/students/${studentId}`);
  revalidatePath("/trainer/students");
}

export async function updateStudentNote(studentId: string, note: string) {
  const supabase = await createClient();
  await supabase.from("students").update({ note }).eq("profile_id", studentId);
  revalidatePath(`/trainer/students/${studentId}`);
  revalidatePath("/trainer/students");
}

export async function toggleStudentStatus(studentId: string, nextStatus: "activo" | "inactivo") {
  const supabase = await createClient();
  await supabase.from("students").update({ status: nextStatus }).eq("profile_id", studentId);
  revalidatePath(`/trainer/students/${studentId}`);
  revalidatePath("/trainer/students");
  revalidatePath("/trainer");
}

export async function assignRoutineToStudent(studentId: string, routineId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Desactivar asignaciones previas y crear la nueva activa.
  await supabase
    .from("assignments")
    .update({ active: false })
    .eq("student_id", studentId)
    .eq("active", true);

  await supabase.from("assignments").insert({
    trainer_id: user.id,
    student_id: studentId,
    routine_id: routineId,
    active: true,
  });

  revalidatePath(`/trainer/students/${studentId}`);
  revalidatePath("/trainer/students");
}

export async function saveFeeConfig(studentId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const feeAmountRaw = String(formData.get("fee_amount") ?? "").trim();
  const feeDueDayRaw = String(formData.get("fee_due_day") ?? "").trim();

  const updateData: {
    fee_amount?: number | null;
    fee_due_day?: number | null;
  } = {};
  if (feeAmountRaw) updateData.fee_amount = Math.max(0, Number(feeAmountRaw));
  else updateData.fee_amount = null;
  if (feeDueDayRaw) updateData.fee_due_day = Math.max(1, Math.min(31, Number(feeDueDayRaw)));
  else updateData.fee_due_day = null;

  const supabase = await createClient();
  const { error } = await supabase.from("students").update(updateData).eq("profile_id", studentId);

  if (error) return { error: "No se pudo guardar la configuración de cuota." };

  revalidatePath(`/trainer/students/${studentId}`);
  return { success: true, message: "Cuota actualizada.", error: null };
}

export async function registerPayment(studentId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const periodMonth = String(formData.get("period_month") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!amountRaw || !periodMonth) return { error: "Completá el monto y el período." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("payments").insert({
    student_id: studentId,
    amount: Math.max(0, Number(amountRaw)),
    period_month: periodMonth,
    trainer_id: user.id,
    notes,
  });

  if (error) return { error: "No se pudo registrar el pago." };

  revalidatePath(`/trainer/students/${studentId}`);
  return { success: true, message: "Pago registrado.", error: null };
}

export async function logMetricForStudent(
  studentId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const weightRaw = String(formData.get("weight_kg") ?? "").trim();
  const heightRaw = String(formData.get("height_cm") ?? "").trim();
  const fatRaw = String(formData.get("body_fat_pct") ?? "").trim();
  const muscleRaw = String(formData.get("muscle_mass_kg") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!weightRaw && !heightRaw && !fatRaw && !muscleRaw) {
    return { error: "Completa al menos un dato (peso, altura, grasa o masa muscular)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("body_metrics").insert({
    student_id: studentId,
    recorded_by: user.id,
    weight_kg: weightRaw ? Number(weightRaw) : null,
    height_cm: heightRaw ? Number(heightRaw) : null,
    body_fat_pct: fatRaw ? Number(fatRaw) : null,
    muscle_mass_kg: muscleRaw ? Number(muscleRaw) : null,
    notes,
  });

  if (error) return { error: "No se pudo guardar la medición." };

  revalidatePath(`/trainer/students/${studentId}`);
  return { error: null };
}
