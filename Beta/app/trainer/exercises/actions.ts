"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types/form";

function parseExerciseFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const focus = String(formData.get("focus") ?? "").trim();
  const sets = Number(formData.get("sets") ?? 3);
  const repsRaw = String(formData.get("reps") ?? "").trim();
  const timeRaw = String(formData.get("time") ?? "").trim();
  const rest = Number(formData.get("rest") ?? 60);

  return {
    name,
    focus,
    default_sets: Number.isFinite(sets) && sets > 0 ? sets : 3,
    default_reps: repsRaw ? Number(repsRaw) : null,
    default_time: timeRaw || null,
    default_rest: Number.isFinite(rest) && rest >= 0 ? rest : 60,
  };
}

export async function createExercise(_prevState: FormState, formData: FormData): Promise<FormState> {
  const fields = parseExerciseFields(formData);
  if (!fields.name) return { error: "El ejercicio necesita un nombre." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("exercises").insert({ ...fields, trainer_id: user.id });
  if (error) return { error: "No se pudo crear el ejercicio." };

  revalidatePath("/trainer/exercises");
  redirect("/trainer/exercises");
}

export async function updateExercise(exerciseId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const fields = parseExerciseFields(formData);
  if (!fields.name) return { error: "El ejercicio necesita un nombre." };

  const supabase = await createClient();
  const { error } = await supabase.from("exercises").update(fields).eq("id", exerciseId);
  if (error) return { error: "No se pudo actualizar el ejercicio." };

  revalidatePath("/trainer/exercises");
  redirect("/trainer/exercises");
}

export async function deleteExercise(exerciseId: string) {
  const supabase = await createClient();
  await supabase.from("exercises").delete().eq("id", exerciseId);
  revalidatePath("/trainer/exercises");
}
