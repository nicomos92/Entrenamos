"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types/form";

export async function updateFullName(_prevState: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "El nombre no puede estar vacío." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  if (error) return { error: "No se pudo actualizar el nombre." };

  revalidatePath("/student/profile");
  return { success: true, message: "Nombre actualizado.", error: null };
}

export async function updateMyProfile(_prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fechaNacimiento = String(formData.get("fecha_nacimiento") ?? "").trim() || null;
  const sexo = String(formData.get("sexo") ?? "").trim() || null;
  const objetivo = String(formData.get("objetivo") ?? "").trim() || null;

  const updateData: { fecha_nacimiento: string | null; sexo: string | null; objetivo?: string | null } = {
    fecha_nacimiento: fechaNacimiento,
    sexo,
  };

  if (objetivo !== null) {
    const { count } = await supabase
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .eq("active", true);
    if (count && count > 0) {
      return { error: "No podés cambiar tu objetivo mientras tengas una rutina activa. Consultá a tu entrenador." };
    }
    updateData.objetivo = objetivo;
  }

  const { error } = await supabase
    .from("students")
    .update(updateData)
    .eq("profile_id", user.id);

  if (error) return { error: "No se pudieron guardar los cambios." };

  revalidatePath("/student/profile");
  return { success: true, message: "Perfil actualizado.", error: null };
}

export async function logBodyMetric(_prevState: FormState, formData: FormData): Promise<FormState> {
  const weightRaw = String(formData.get("weight_kg") ?? "").trim();
  const heightRaw = String(formData.get("height_cm") ?? "").trim();
  const fatRaw = String(formData.get("body_fat_pct") ?? "").trim();
  const muscleRaw = String(formData.get("muscle_mass_kg") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const recordedAt = String(formData.get("recorded_at") ?? "").trim() || undefined;

  if (!weightRaw && !heightRaw && !fatRaw && !muscleRaw) {
    return { error: "Completa al menos un dato (peso, altura, grasa o masa muscular)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("body_metrics").insert({
    student_id: user.id,
    recorded_by: user.id,
    recorded_at: recordedAt,
    weight_kg: weightRaw ? Number(weightRaw) : null,
    height_cm: heightRaw ? Number(heightRaw) : null,
    body_fat_pct: fatRaw ? Number(fatRaw) : null,
    muscle_mass_kg: muscleRaw ? Number(muscleRaw) : null,
    notes,
  });

  if (error) return { error: "No se pudo guardar la medición." };

  revalidatePath("/student/profile");
  return { success: true, message: "Medición guardada.", error: null };
}
