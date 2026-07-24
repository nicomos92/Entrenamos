"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface FinishSessionInput {
  assignmentId: string;
  routineId: string;
  totalExercises: number;
  completedExerciseIds: string[];
  effort: number;
  elapsedMinutes: number;
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
    const { error: exercisesError } = await supabase.from("session_exercises").insert(
      input.completedExerciseIds.map((exerciseId) => ({
        session_id: session.id,
        exercise_id: exerciseId,
        completed: true,
      }))
    );

    if (exercisesError) {
      await supabase.from("sessions").delete().eq("id", session.id);
      redirect("/student/workout");
    }
  }

  redirect(`/student/summary?session=${session.id}`);
}

export async function updateSessionNote(sessionId: string, note: string) {
  const supabase = await createClient();
  await supabase.from("sessions").update({ coach_note: note }).eq("id", sessionId);
  revalidatePath(`/student/summary`);
}
