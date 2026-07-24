"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

export type ImportResult = {
  error?: string;
  exercisesCreated?: number;
  routinesCreated?: number;
};

export async function importExcel(_prevState: ImportResult, formData: FormData): Promise<ImportResult> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Seleccioná un archivo Excel." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const buffer = Buffer.from(await file.arrayBuffer());
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    return { error: "No se pudo leer el archivo. Asegurate de que sea un .xlsx o .xls válido." };
  }

  let exercisesCreated = 0;
  let routinesCreated = 0;

  // ── Sheet "Ejercicios" ──
  const ejSheet = workbook.Sheets["Ejercicios"];
  if (ejSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ejSheet);
    const exercisesToInsert: {
      trainer_id: string;
      name: string;
      description: string | null;
      focus: string;
      image_url: string | null;
      video_url: string | null;
    }[] = [];

    for (const row of rows) {
      const name = String(row["Nombre"] ?? row["name"] ?? "").trim();
      if (!name) continue;

      exercisesToInsert.push({
        trainer_id: user.id,
        name,
        description: String(row["Descripción"] ?? row["description"] ?? "").trim() || null,
        focus: String(row["Foco"] ?? row["focus"] ?? "").trim(),
        image_url: String(row["Imagen"] ?? row["image_url"] ?? "").trim() || null,
        video_url: String(row["Video"] ?? row["video_url"] ?? "").trim() || null,
      });
    }

    if (exercisesToInsert.length > 0) {
      const { error } = await supabase.from("exercises").insert(exercisesToInsert);
      if (error) return { error: `Error al importar ejercicios: ${error.message}` };
      exercisesCreated = exercisesToInsert.length;
    }
  }

  // ── Sheet "Rutinas" ──
  const rtSheet = workbook.Sheets["Rutinas"];
  if (rtSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(rtSheet);
    if (rows.length > 0) {
      // Group rows by routine name
      const routineMap = new Map<string, {
        goal: string;
        estimated_minutes: number;
        exercises: { name: string; sets: number; reps: number | null; time: string | null; rest: number; order_index: number }[];
      }>();

      for (const row of rows) {
        const routineName = String(row["Rutina"] ?? row["routine_name"] ?? "").trim();
        if (!routineName) continue;

        if (!routineMap.has(routineName)) {
          routineMap.set(routineName, {
            goal: String(row["Objetivo"] ?? row["goal"] ?? "").trim(),
            estimated_minutes: Number(row["Duracion"] ?? row["estimated_minutes"] ?? 30) || 30,
            exercises: [],
          });
        }

        const exerciseName = String(row["Ejercicio"] ?? row["exercise_name"] ?? "").trim();
        if (!exerciseName) continue;

        const entry = routineMap.get(routineName)!;
        entry.exercises.push({
          name: exerciseName,
          sets: Number(row["Series"] ?? 3) || 3,
          reps: row["Reps"] != null && row["Reps"] !== "" && row["Reps"] !== "-" ? Number(row["Reps"]) || null : null,
          time: row["Tiempo"] != null && String(row["Tiempo"]).trim() ? String(row["Tiempo"]).trim() : null,
          rest: Number(row["Descanso"] ?? 60) || 60,
          order_index: entry.exercises.length,
        });
      }

      // Resolve exercise IDs by name for each trainer
      const { data: existingExercises } = await supabase
        .from("exercises")
        .select("id, name")
        .eq("trainer_id", user.id);

      const exerciseIdByName = new Map<string, string>();
      if (existingExercises) {
        for (const ex of existingExercises) {
          exerciseIdByName.set(ex.name.toLowerCase().trim(), ex.id);
        }
      }

      for (const [routineName, data] of routineMap) {
        const { data: newRoutine, error: rtError } = await supabase
          .from("routines")
          .insert({
            trainer_id: user.id,
            name: routineName,
            goal: data.goal,
            estimated_minutes: data.estimated_minutes,
          })
          .select("id")
          .single();

        if (rtError || !newRoutine) continue;
        routinesCreated++;

        const routineExercises: {
          routine_id: string;
          exercise_id: string;
          sets: number;
          reps: number | null;
          time: string | null;
          rest: number;
          order_index: number;
        }[] = [];

        for (const ex of data.exercises) {
          const exerciseId = exerciseIdByName.get(ex.name.toLowerCase().trim());
          if (!exerciseId) {
            // Auto-create exercise if it doesn't exist
            const { data: newExercise, error: exError } = await supabase
              .from("exercises")
              .insert({
                trainer_id: user.id,
                name: ex.name,
                focus: "",
              })
              .select("id")
              .single();

            if (exError || !newExercise) continue;
            exerciseIdByName.set(ex.name.toLowerCase().trim(), newExercise.id);
            exercisesCreated++;
            routineExercises.push({
              routine_id: newRoutine.id,
              exercise_id: newExercise.id,
              sets: ex.sets,
              reps: ex.reps,
              time: ex.time,
              rest: ex.rest,
              order_index: ex.order_index,
            });
          } else {
            routineExercises.push({
              routine_id: newRoutine.id,
              exercise_id: exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              time: ex.time,
              rest: ex.rest,
              order_index: ex.order_index,
            });
          }
        }

        if (routineExercises.length > 0) {
          await supabase.from("routine_exercises").insert(routineExercises);
        }
      }
    }
  }

  if (exercisesCreated === 0 && routinesCreated === 0) {
    return { error: "No se encontraron datos en las hojas 'Ejercicios' o 'Rutinas'. Revisá el formato del archivo." };
  }

  revalidatePath("/trainer/exercises");
  revalidatePath("/trainer/routines");
  return { exercisesCreated, routinesCreated };
}
