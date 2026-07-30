"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types/form";

export async function createRoutine(_prevState: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const estimatedMinutes = Number(formData.get("estimated_minutes") ?? 30);

  if (!name) return { error: "La rutina necesita un nombre." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("routines")
    .insert({
      trainer_id: user.id,
      name,
      goal,
      estimated_minutes: Number.isFinite(estimatedMinutes) && estimatedMinutes > 0 ? estimatedMinutes : 30,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "No se pudo crear la rutina." };

  revalidatePath("/trainer/routines");
  redirect(`/trainer/routines/${data.id}`);
}

export async function deleteRoutine(routineId: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("assignments")
    .select("id", { count: "exact", head: true })
    .eq("routine_id", routineId)
    .eq("active", true);

  if (count && count > 0) {
    return;
  }

  await supabase.from("routines").delete().eq("id", routineId);
  revalidatePath("/trainer/routines");
  redirect("/trainer/routines");
}

export async function addExerciseToRoutine(routineId: string, formData: FormData) {
  const exerciseId = String(formData.get("exercise_id") ?? "");
  const sets = Number(formData.get("sets") ?? 3);
  const timeRaw = String(formData.get("time") ?? "").trim();
  const rest = Number(formData.get("rest") ?? 60);
  const intensityRaw = String(formData.get("intensity_pct") ?? "").trim();

  if (!exerciseId) return;

  const supabase = await createClient();

  const { data: maxOrderData } = await supabase
    .from("routine_exercises")
    .select("order_index")
    .eq("routine_id", routineId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrderIndex = ((maxOrderData?.order_index as number) ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("routine_exercises")
    .insert({
      routine_id: routineId,
      exercise_id: exerciseId,
      order_index: nextOrderIndex,
      sets: Number.isFinite(sets) && sets > 0 ? sets : 3,
      time: timeRaw || null,
      rest: Number.isFinite(rest) && rest >= 0 ? rest : 60,
      intensity_pct: intensityRaw ? Math.max(1, Math.min(100, Number(intensityRaw))) : null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    revalidatePath(`/trainer/routines/${routineId}`);
    return;
  }

  // Parse per-set reps and weight
  const setRows: {
    routine_exercise_id: string;
    set_number: number;
    reps: number | null;
    weight_kg: number | null;
  }[] = [];

  for (let i = 0; i < sets; i++) {
    const repsVal = String(formData.get(`reps_${i}`) ?? "").trim();
    const weightVal = String(formData.get(`weight_${i}`) ?? "").trim();
    if (!repsVal && !weightVal) {
      setRows.push({
        routine_exercise_id: inserted.id,
        set_number: i + 1,
        reps: null,
        weight_kg: null,
      });
      continue;
    }
    setRows.push({
      routine_exercise_id: inserted.id,
      set_number: i + 1,
      reps: repsVal ? Math.max(1, Number(repsVal)) : null,
      weight_kg: weightVal ? Math.max(0, Number(weightVal)) : null,
    });
  }

  if (setRows.length > 0) {
    await supabase.from("routine_exercise_sets").insert(setRows);
  }

  revalidatePath(`/trainer/routines/${routineId}`);
}

export async function removeExerciseFromRoutine(routineId: string, routineExerciseId: string) {
  const supabase = await createClient();
  await supabase.from("routine_exercises").delete().eq("id", routineExerciseId);
  revalidatePath(`/trainer/routines/${routineId}`);
}
