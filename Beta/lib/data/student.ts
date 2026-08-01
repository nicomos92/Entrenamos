import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { safeGet } from "@/lib/utils/safe";

type Client = SupabaseClient<Database>;

export interface AssignedSetConfig {
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  unit: "reps" | "time";
  durationSeconds: number | null;
}

export interface AssignedExercise {
  id: string;
  exerciseId: string;
  name: string;
  focus: string;
  sets: number;
  reps: number | null;
  time: string | null;
  rest: number;
  intensityPct: number | null;
  dayNumber: number;
  setsConfig: AssignedSetConfig[];
  imageUrl: string | null;
  videoUrl: string | null;
}

export interface AssignedRoutine {
  assignmentId: string;
  routineId: string;
  name: string;
  goal: string;
  estimatedMinutes: number;
  status: "borrador" | "activa";
  startDate: string | null;
  endDate: string | null;
  days: number;
  startWeekday: number;
  exercises: AssignedExercise[];
}

export async function getActiveAssignment(supabase: Client, studentId: string): Promise<AssignedRoutine | null> {
  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, routine_id, routines(name, goal, estimated_minutes, status, start_date, end_date, days, start_weekday)")
    .eq("student_id", studentId)
    .eq("active", true)
    .maybeSingle();

  if (!assignment) return null;

  const routine = safeGet<{
    name: string;
    goal: string;
    estimated_minutes: number;
    status: string;
    start_date: string | null;
    end_date: string | null;
    days: number;
    start_weekday: number;
  }>(assignment.routines);
  if (!routine) return null;

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select("id, exercise_id, sets, reps, time, rest, order_index, intensity_pct, day_number, exercises(name, focus, image_url, video_url)")
    .eq("routine_id", assignment.routine_id)
    .order("day_number", { ascending: true })
    .order("order_index", { ascending: true });

  const exerciseIds = (routineExercises ?? []).map((re) => re.id);

  const { data: setsData } = exerciseIds.length > 0
    ? await supabase
        .from("routine_exercise_sets")
        .select("routine_exercise_id, set_number, reps, weight_kg, unit, duration_seconds")
        .in("routine_exercise_id", exerciseIds)
        .order("set_number", { ascending: true })
    : { data: [] };

  const setsByExercise: Record<string, AssignedSetConfig[]> = {};
  for (const s of setsData ?? []) {
    if (!setsByExercise[s.routine_exercise_id]) setsByExercise[s.routine_exercise_id] = [];
    setsByExercise[s.routine_exercise_id].push({
      setNumber: s.set_number,
      reps: s.reps,
      weightKg: s.weight_kg,
      unit: s.unit === "time" ? "time" : "reps",
      durationSeconds: s.duration_seconds,
    });
  }

  return {
    assignmentId: assignment.id,
    routineId: assignment.routine_id,
    name: routine.name,
    goal: routine.goal,
    estimatedMinutes: routine.estimated_minutes,
    status: routine.status === "borrador" ? "borrador" : "activa",
    startDate: routine.start_date,
    endDate: routine.end_date,
    days: Math.max(1, routine.days ?? 1),
    startWeekday: routine.start_weekday ?? 1,
    exercises: (routineExercises ?? []).map((re) => {
      const ex = safeGet<{ name: string; focus: string; image_url: string | null; video_url: string | null }>(re.exercises);
      return {
        id: re.id,
        exerciseId: re.exercise_id,
        name: ex?.name ?? "Ejercicio",
        focus: ex?.focus ?? "",
        sets: re.sets,
        reps: re.reps,
        time: re.time,
        rest: re.rest,
        intensityPct: re.intensity_pct,
        dayNumber: re.day_number ?? 1,
        setsConfig: setsByExercise[re.id] ?? [],
        imageUrl: ex?.image_url ?? null,
        videoUrl: ex?.video_url ?? null,
      };
    }),
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
    routineName: safeGet<{ name: string }>(session.routines)?.name ?? "Rutina",
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
