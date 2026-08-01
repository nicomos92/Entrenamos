"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface SetInput {
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  rpe?: number;
}

interface ExerciseFeedback {
  exerciseId: string;
  difficulty?: number;
  notes?: string;
  sets?: SetInput[];
}

interface FinishSessionInput {
  assignmentId: string;
  routineId: string;
  totalExercises: number;
  completedExerciseIds: string[];
  effort: number;
  elapsedMinutes: number;
  exerciseFeedback?: ExerciseFeedback[];
}

export async function finishSession(input: FinishSessionInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isComplete = input.totalExercises > 0 && input.completedExerciseIds.length === input.totalExercises;

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      student_id: user.id,
      routine_id: input.routineId,
      assignment_id: input.assignmentId,
      effort: input.effort,
      elapsed_minutes: input.elapsedMinutes,
      status: isComplete ? "completada" : "incompleta",
    })
    .select("id")
    .single();

  if (error || !session) {
    redirect("/student");
  }

  if (input.completedExerciseIds.length > 0) {
    const feedbackMap: Record<string, ExerciseFeedback> = {};
    for (const fb of input.exerciseFeedback ?? []) {
      feedbackMap[fb.exerciseId] = fb;
    }

    const sessionExercises = [];
    for (const exerciseId of input.completedExerciseIds) {
      const fb = feedbackMap[exerciseId];
      sessionExercises.push({
        session_id: session.id,
        exercise_id: exerciseId,
        completed: true,
        difficulty: fb?.difficulty ?? null,
        notes: fb?.notes ?? null,
      });
    }

    const { data: inserted, error: exercisesError } = await supabase
      .from("session_exercises")
      .insert(sessionExercises)
      .select("id, exercise_id");

    if (exercisesError) {
      await supabase.from("sessions").delete().eq("id", session.id);
      redirect("/student/workout");
    }

    const setIdByExercise: Record<string, string> = {};
    for (const se of inserted ?? []) {
      setIdByExercise[se.exercise_id] = se.id;
    }

    const allSets: {
      session_exercise_id: string;
      set_number: number;
      weight_kg: number | null;
      reps: number | null;
      duration_seconds: number | null;
      rpe: number | null;
    }[] = [];

    for (const fb of input.exerciseFeedback ?? []) {
      const seId = setIdByExercise[fb.exerciseId];
      if (!seId || !fb.sets || fb.sets.length === 0) continue;
      for (let i = 0; i < fb.sets.length; i++) {
        allSets.push({
          session_exercise_id: seId,
          set_number: i + 1,
          weight_kg: fb.sets[i].weightKg ?? null,
          reps: fb.sets[i].reps ?? null,
          duration_seconds: fb.sets[i].durationSeconds ?? null,
          rpe: fb.sets[i].rpe ?? null,
        });
      }
    }

    if (allSets.length > 0) {
      await supabase.from("exercise_sets").insert(allSets);
    }
  }

  redirect(`/student/summary?session=${session.id}`);
}

export async function updateSessionNote(sessionId: string, note: string) {
  const supabase = await createClient();
  await supabase.from("sessions").update({ coach_note: note }).eq("id", sessionId);
  revalidatePath(`/student/summary`);
}
