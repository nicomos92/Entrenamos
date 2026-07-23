import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export interface AssignedExercise {
  id: string;
  exerciseId: string;
  name: string;
  focus: string;
  sets: number;
  reps: number | null;
  time: string | null;
  rest: number;
}

export interface AssignedRoutine {
  assignmentId: string;
  routineId: string;
  name: string;
  goal: string;
  estimatedMinutes: number;
  exercises: AssignedExercise[];
}

export async function getActiveAssignment(supabase: Client, studentId: string): Promise<AssignedRoutine | null> {
  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, routine_id, routines(name, goal, estimated_minutes)")
    .eq("student_id", studentId)
    .eq("active", true)
    .maybeSingle();

  if (!assignment) return null;

  const routine = assignment.routines as unknown as { name: string; goal: string; estimated_minutes: number } | null;
  if (!routine) return null;

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select("id, exercise_id, sets, reps, time, rest, order_index, exercises(name, focus)")
    .eq("routine_id", assignment.routine_id)
    .order("order_index", { ascending: true });

  return {
    assignmentId: assignment.id,
    routineId: assignment.routine_id,
    name: routine.name,
    goal: routine.goal,
    estimatedMinutes: routine.estimated_minutes,
    exercises: (routineExercises ?? []).map((re) => ({
      id: re.id,
      exerciseId: re.exercise_id,
      name: (re.exercises as unknown as { name: string; focus: string } | null)?.name ?? "Ejercicio",
      focus: (re.exercises as unknown as { name: string; focus: string } | null)?.focus ?? "",
      sets: re.sets,
      reps: re.reps,
      time: re.time,
      rest: re.rest,
    })),
  };
}

const WEEKLY_GOAL = 5;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getWeeklyProgress(supabase: Client, studentId: string) {
  const weekAgo = new Date(Date.now() - ONE_WEEK_MS).toISOString();
  const { count } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .gte("created_at", weekAgo);

  const done = count ?? 0;
  return { done, goal: WEEKLY_GOAL, percentage: Math.min(100, (done / WEEKLY_GOAL) * 100) };
}

export async function getSessionWithRoutine(supabase: Client, sessionId: string, studentId: string) {
  const { data: session } = await supabase
    .from("sessions")
    .select("id, effort, elapsed_minutes, status, coach_note, created_at, routine_id, routines(name)")
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!session) return null;

  const { count: totalExercises } = await supabase
    .from("routine_exercises")
    .select("id", { count: "exact", head: true })
    .eq("routine_id", session.routine_id);

  const { count: completedExercises } = await supabase
    .from("session_exercises")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("completed", true);

  return {
    ...session,
    routineName: (session.routines as unknown as { name: string } | null)?.name ?? "Rutina",
    totalExercises: totalExercises ?? 0,
    completedExercises: completedExercises ?? 0,
  };
}

export async function getLatestSession(supabase: Client, studentId: string) {
  const { data } = await supabase
    .from("sessions")
    .select("id")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
