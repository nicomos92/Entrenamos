import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { safeGet } from "@/lib/utils/safe";

type Client = SupabaseClient<Database>;

export interface StudentWithStats {
  profileId: string;
  fullName: string;
  email: string;
  status: "activo" | "inactivo";
  note: string;
  routineName: string | null;
  routineId: string | null;
  nextSchedule: { diaSemana: number; hora: string } | null;
  scheduleToday: number;
  weeklyCompleted: number;
  lastEffort: number | null;
}

const WEEKLY_GOAL = 5;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function nextScheduleEntry(
  entries: { diaSemana: number; hora: string }[]
): { diaSemana: number; hora: string } | null {
  if (entries.length === 0) return null;
  const today = new Date().getDay();
  return [...entries].sort((a, b) => {
    const daysA = (a.diaSemana - today + 7) % 7;
    const daysB = (b.diaSemana - today + 7) % 7;
    if (daysA !== daysB) return daysA - daysB;
    return a.hora.localeCompare(b.hora);
  })[0] ?? null;
}

export async function getStudentsWithStats(supabase: Client, trainerId: string): Promise<StudentWithStats[]> {
  const { data: students } = await supabase
    .from("students")
    .select("profile_id, status, note")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (!students || students.length === 0) return [];

  const profileIds = students.map((s) => s.profile_id);
  const weekAgo = new Date(Date.now() - ONE_WEEK_MS).toISOString();

  const [{ data: profiles }, { data: assignments }, { data: schedules }, { data: sessions }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").in("id", profileIds),
    supabase
      .from("assignments")
      .select("student_id, routine_id, routines(name)")
      .eq("trainer_id", trainerId)
      .eq("active", true),
    supabase.from("student_schedules").select("student_id, dia_semana, hora").in("student_id", profileIds),
    supabase
      .from("sessions")
      .select("student_id, effort, created_at")
      .in("student_id", profileIds)
      .order("created_at", { ascending: false }),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [
      a.student_id,
      { routineId: a.routine_id, routineName: safeGet<{ name: string }>(a.routines)?.name ?? null },
    ])
  );
  const scheduleMap = new Map<string, { diaSemana: number; hora: string }[]>();
  for (const s of schedules ?? []) {
    if (!scheduleMap.has(s.student_id)) scheduleMap.set(s.student_id, []);
    scheduleMap.get(s.student_id)!.push({ diaSemana: s.dia_semana, hora: s.hora });
  }
  const todayWeekday = new Date().getDay();
  const lastEffortMap = new Map<string, number>();
  const weeklyCountMap = new Map<string, number>();
  for (const session of sessions ?? []) {
    if (!lastEffortMap.has(session.student_id) && session.effort != null) {
      lastEffortMap.set(session.student_id, session.effort);
    }
    if (session.created_at >= weekAgo) {
      weeklyCountMap.set(session.student_id, (weeklyCountMap.get(session.student_id) ?? 0) + 1);
    }
  }

  return students.map((student) => {
    const profile = profileMap.get(student.profile_id);
    const assignment = assignmentMap.get(student.profile_id);
    const studentSchedules = scheduleMap.get(student.profile_id) ?? [];
    return {
      profileId: student.profile_id,
      fullName: profile?.full_name ?? "Alumno",
      email: profile?.email ?? "",
      status: student.status,
      note: student.note,
      routineName: assignment?.routineName ?? null,
      routineId: assignment?.routineId ?? null,
      nextSchedule: nextScheduleEntry(studentSchedules),
      scheduleToday: studentSchedules.filter((s) => s.diaSemana === todayWeekday).length,
      weeklyCompleted: weeklyCountMap.get(student.profile_id) ?? 0,
      lastEffort: lastEffortMap.get(student.profile_id) ?? null,
    };
  });
}

export const WEEKLY_ADHERENCE_GOAL = WEEKLY_GOAL;

export async function getExercises(supabase: Client, trainerId: string) {
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export interface RoutineSetConfig {
  id: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  unit: "reps" | "time";
  durationSeconds: number | null;
}

export interface RoutineWithExercises {
  id: string;
  name: string;
  goal: string;
  estimated_minutes: number;
  status: "borrador" | "activa";
  start_date: string | null;
  end_date: string | null;
  days: number;
  start_weekday: number;
  exercises: {
    id: string;
    exercise_id: string;
    name: string;
    sets: number;
    reps: number | null;
    time: string | null;
    rest: number;
    intensity_pct: number | null;
    day_number: number;
    order_index: number;
    routineExerciseSets: RoutineSetConfig[];
  }[];
}

export async function getRoutines(supabase: Client, trainerId: string): Promise<RoutineWithExercises[]> {
  const { data: routines } = await supabase
    .from("routines")
    .select("id, name, goal, estimated_minutes, status, start_date, end_date, days, start_weekday")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (!routines || routines.length === 0) return [];

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select("id, routine_id, exercise_id, sets, reps, time, rest, order_index, intensity_pct, day_number, exercises(name)")
    .in(
      "routine_id",
      routines.map((r) => r.id)
    )
    .order("day_number", { ascending: true })
    .order("order_index", { ascending: true });

  const reIds = (routineExercises ?? []).map((re) => re.id);
  const { data: setsData } = reIds.length > 0
    ? await supabase
        .from("routine_exercise_sets")
        .select("id, routine_exercise_id, set_number, reps, weight_kg, unit, duration_seconds")
        .in("routine_exercise_id", reIds)
        .order("set_number", { ascending: true })
    : { data: [] };

  const setsByRe: Record<string, RoutineSetConfig[]> = {};
  for (const s of setsData ?? []) {
    if (!setsByRe[s.routine_exercise_id]) setsByRe[s.routine_exercise_id] = [];
    setsByRe[s.routine_exercise_id].push({
      id: s.id,
      setNumber: s.set_number,
      reps: s.reps,
      weightKg: s.weight_kg,
      unit: s.unit === "time" ? "time" : "reps",
      durationSeconds: s.duration_seconds,
    });
  }

  return routines.map((routine) => ({
    ...routine,
    status: routine.status === "borrador" ? ("borrador" as const) : ("activa" as const),
    exercises: (routineExercises ?? [])
      .filter((re) => re.routine_id === routine.id)
      .map((re) => ({
        id: re.id,
        exercise_id: re.exercise_id,
        name: (re.exercises as unknown as { name: string } | null)?.name ?? "Ejercicio",
        sets: re.sets,
        reps: re.reps,
        time: re.time,
        rest: re.rest,
        intensity_pct: re.intensity_pct,
        day_number: re.day_number,
        order_index: re.order_index,
        routineExerciseSets: setsByRe[re.id] ?? [],
      })),
  }));
}

export interface WeeklyScheduleEntry {
  id: string;
  studentId: string;
  studentName: string;
  diaSemana: number;
  hora: string;
}

export async function getWeeklySchedule(supabase: Client, trainerId: string): Promise<WeeklyScheduleEntry[]> {
  const { data: students } = await supabase
    .from("students")
    .select("profile_id")
    .eq("trainer_id", trainerId);

  if (!students || students.length === 0) return [];

  const profileIds = students.map((s) => s.profile_id);

  const [{ data: schedules }, { data: profiles }] = await Promise.all([
    supabase
      .from("student_schedules")
      .select("id, student_id, dia_semana, hora")
      .in("student_id", profileIds)
      .order("dia_semana", { ascending: true })
      .order("hora", { ascending: true }),
    supabase.from("profiles").select("id, full_name").in("id", profileIds),
  ]);

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (schedules ?? []).map((s) => ({
    id: s.id,
    studentId: s.student_id,
    studentName: nameMap.get(s.student_id) ?? "Alumno",
    diaSemana: s.dia_semana,
    hora: s.hora.slice(0, 5),
  }));
}
