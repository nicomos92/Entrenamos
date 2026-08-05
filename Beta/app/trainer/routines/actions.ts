"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types/form";

interface SetRow {
  routine_exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  unit: "reps" | "time";
  duration_seconds: number | null;
}

function parseSetRows(routineExerciseId: string, formData: FormData, sets: number): SetRow[] {
  const rows: SetRow[] = [];
  for (let i = 0; i < sets; i++) {
    const unit = String(formData.get(`unit_${i}`) ?? "reps") === "time" ? "time" : "reps";
    const repsVal = String(formData.get(`reps_${i}`) ?? "").trim();
    const weightVal = String(formData.get(`weight_${i}`) ?? "").trim();
    const durationVal = String(formData.get(`duration_${i}`) ?? "").trim();
    rows.push({
      routine_exercise_id: routineExerciseId,
      set_number: i + 1,
      reps: unit === "reps" && repsVal ? Math.max(1, Number(repsVal)) : null,
      weight_kg: weightVal ? Math.max(0, Number(weightVal)) : null,
      unit,
      duration_seconds: unit === "time" && durationVal ? Math.max(1, Number(durationVal)) : null,
    });
  }
  return rows;
}

export async function createRoutine(_prevState: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const estimatedMinutes = Number(formData.get("estimated_minutes") ?? 30);
  const days = Math.max(1, Math.min(7, Number(formData.get("days") ?? 1) || 1));
  const startWeekday = Math.max(0, Math.min(6, Number(formData.get("start_weekday") ?? 1) || 1));

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
      status: "activa",
      days,
      start_weekday: startWeekday,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "No se pudo crear la rutina." };

  revalidatePath("/trainer/routines");
  redirect(`/trainer/routines/${data.id}`);
}

export async function updateRoutine(routineId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const estimatedMinutes = Number(formData.get("estimated_minutes") ?? 30);
  const days = Math.max(1, Math.min(7, Number(formData.get("days") ?? 1) || 1));
  const startWeekday = Math.max(0, Math.min(6, Number(formData.get("start_weekday") ?? 1) || 1));

  if (!name) return { error: "La rutina necesita un nombre." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("routines")
    .update({
      name,
      goal,
      estimated_minutes: Number.isFinite(estimatedMinutes) && estimatedMinutes > 0 ? estimatedMinutes : 30,
      days,
      start_weekday: startWeekday,
    })
    .eq("id", routineId)
    .eq("trainer_id", user.id);

  if (error) return { error: "No se pudo actualizar la rutina." };

  revalidatePath(`/trainer/routines/${routineId}`);
  revalidatePath("/trainer/routines");
  return { success: true, message: "Rutina actualizada.", error: null };
}

export async function publishRoutine(routineId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();

  if (!startDate || !endDate) return { error: "Definí las fechas de uso para activar la rutina." };
  if (endDate < startDate) return { error: "La fecha de fin no puede ser anterior al inicio." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("routines")
    .update({ status: "activa", start_date: startDate, end_date: endDate })
    .eq("id", routineId)
    .eq("trainer_id", user.id);

  if (error) return { error: "No se pudo activar la rutina." };

  revalidatePath(`/trainer/routines/${routineId}`);
  revalidatePath("/trainer/routines");
  return { success: true, message: "Rutina activada.", error: null };
}

export async function setRoutineDraft(routineId: string) {
  const supabase = await createClient();
  await supabase.from("routines").update({ status: "borrador" }).eq("id", routineId);
  revalidatePath(`/trainer/routines/${routineId}`);
  revalidatePath("/trainer/routines");
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
  const dayNumber = Math.max(1, Number(formData.get("day_number") ?? 1) || 1);

  if (!exerciseId) return;

  const supabase = await createClient();

  const { data: maxOrderData } = await supabase
    .from("routine_exercises")
    .select("order_index")
    .eq("routine_id", routineId)
    .eq("day_number", dayNumber)
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
      day_number: dayNumber,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    revalidatePath(`/trainer/routines/${routineId}`);
    return;
  }

  const setRows = parseSetRows(inserted.id, formData, Math.max(1, sets));
  if (setRows.length > 0) {
    await supabase.from("routine_exercise_sets").insert(setRows);
  }

  revalidatePath(`/trainer/routines/${routineId}`);
}

export async function updateExerciseInRoutine(routineId: string, formData: FormData) {
  const routineExerciseId = String(formData.get("routine_exercise_id") ?? "");
  const exerciseId = String(formData.get("exercise_id") ?? "");
  const sets = Number(formData.get("sets") ?? 3);
  const timeRaw = String(formData.get("time") ?? "").trim();
  const rest = Number(formData.get("rest") ?? 60);
  const intensityRaw = String(formData.get("intensity_pct") ?? "").trim();
  const dayNumber = Math.max(1, Number(formData.get("day_number") ?? 1) || 1);

  if (!routineExerciseId || !exerciseId) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("routine_exercises")
    .update({
      exercise_id: exerciseId,
      sets: Number.isFinite(sets) && sets > 0 ? sets : 3,
      time: timeRaw || null,
      rest: Number.isFinite(rest) && rest >= 0 ? rest : 60,
      intensity_pct: intensityRaw ? Math.max(1, Math.min(100, Number(intensityRaw))) : null,
      day_number: dayNumber,
    })
    .eq("id", routineExerciseId)
    .eq("routine_id", routineId);

  if (error) {
    revalidatePath(`/trainer/routines/${routineId}`);
    return;
  }

  await supabase.from("routine_exercise_sets").delete().eq("routine_exercise_id", routineExerciseId);

  const setRows = parseSetRows(routineExerciseId, formData, Math.max(1, sets));
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

export async function reorderExercises(routineId: string, dayNumber: number, orderedIds: string[]) {
  const supabase = await createClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("routine_exercises")
      .update({ order_index: i })
      .eq("id", orderedIds[i])
      .eq("routine_id", routineId)
      .eq("day_number", dayNumber);
  }
  revalidatePath(`/trainer/routines/${routineId}`);
  revalidatePath("/trainer/routines");
}

export async function duplicateRoutine(routineId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: routine } = await supabase
    .from("routines")
    .select("name, goal, estimated_minutes, days, start_weekday")
    .eq("id", routineId)
    .single();

  if (!routine) return;

  const { data: exercises } = await supabase
    .from("routine_exercises")
    .select("id, exercise_id, order_index, sets, reps, time, rest, intensity_pct, day_number")
    .eq("routine_id", routineId)
    .order("order_index", { ascending: true });

  const { data: copy } = await supabase
    .from("routines")
    .insert({
      trainer_id: user.id,
      name: `${routine.name} (copia)`,
      goal: routine.goal,
      estimated_minutes: routine.estimated_minutes,
      days: routine.days,
      start_weekday: routine.start_weekday,
      status: "borrador",
      start_date: null,
      end_date: null,
    })
    .select("id")
    .single();

  if (!copy) return;

  const idMap = new Map<string, string>();
  for (const ex of exercises ?? []) {
    const { data: newEx } = await supabase
      .from("routine_exercises")
      .insert({
        routine_id: copy.id,
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        sets: ex.sets,
        reps: ex.reps,
        time: ex.time,
        rest: ex.rest,
        intensity_pct: ex.intensity_pct,
        day_number: ex.day_number,
      })
      .select("id")
      .single();
    if (newEx) idMap.set(ex.id, newEx.id);
  }

  const reIds = (exercises ?? []).map((ex) => ex.id);
  if (reIds.length > 0) {
    const { data: sets } = await supabase
      .from("routine_exercise_sets")
      .select("routine_exercise_id, set_number, reps, weight_kg, unit, duration_seconds")
      .in("routine_exercise_id", reIds);
    for (const s of sets ?? []) {
      const newReId = idMap.get(s.routine_exercise_id);
      if (!newReId) continue;
      await supabase.from("routine_exercise_sets").insert({
        routine_exercise_id: newReId,
        set_number: s.set_number,
        reps: s.reps,
        weight_kg: s.weight_kg,
        unit: s.unit,
        duration_seconds: s.duration_seconds,
      });
    }
  }

  revalidatePath("/trainer/routines");
  redirect(`/trainer/routines/${copy.id}`);
}
