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
  nextAppointment: string | null;
  weeklyCompleted: number;
  lastEffort: number | null;
}

const WEEKLY_GOAL = 5;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getStudentsWithStats(supabase: Client, trainerId: string): Promise<StudentWithStats[]> {
  const { data: students } = await supabase
    .from("students")
    .select("profile_id, status, note")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (!students || students.length === 0) return [];

  const profileIds = students.map((s) => s.profile_id);
  const weekAgo = new Date(Date.now() - ONE_WEEK_MS).toISOString();

  const [{ data: profiles }, { data: assignments }, { data: appointments }, { data: sessions }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").in("id", profileIds),
    supabase
      .from("assignments")
      .select("student_id, routine_id, routines(name)")
      .eq("trainer_id", trainerId)
      .eq("active", true),
    supabase
      .from("appointments")
      .select("student_id, scheduled_at")
      .eq("trainer_id", trainerId)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true }),
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
  const nextAppointmentMap = new Map<string, string>();
  for (const appt of appointments ?? []) {
    if (!nextAppointmentMap.has(appt.student_id)) {
      nextAppointmentMap.set(appt.student_id, appt.scheduled_at);
    }
  }
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
    return {
      profileId: student.profile_id,
      fullName: profile?.full_name ?? "Alumno",
      email: profile?.email ?? "",
      status: student.status,
      note: student.note,
      routineName: assignment?.routineName ?? null,
      routineId: assignment?.routineId ?? null,
      nextAppointment: nextAppointmentMap.get(student.profile_id) ?? null,
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

export interface RoutineWithExercises {
  id: string;
  name: string;
  goal: string;
  estimated_minutes: number;
  exercises: {
    id: string;
    exercise_id: string;
    name: string;
    sets: number;
    reps: number | null;
    time: string | null;
    rest: number;
    order_index: number;
  }[];
}

export async function getRoutines(supabase: Client, trainerId: string): Promise<RoutineWithExercises[]> {
  const { data: routines } = await supabase
    .from("routines")
    .select("id, name, goal, estimated_minutes")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (!routines || routines.length === 0) return [];

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select("id, routine_id, exercise_id, sets, reps, time, rest, order_index, exercises(name)")
    .in(
      "routine_id",
      routines.map((r) => r.id)
    )
    .order("order_index", { ascending: true });

  return routines.map((routine) => ({
    ...routine,
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
        order_index: re.order_index,
      })),
  }));
}

export async function getAppointments(supabase: Client, trainerId: string) {
  const { data } = await supabase
    .from("appointments")
    .select("id, student_id, scheduled_at, status, notes, duration_minutes, recurring_group_id, recurring_rule")
    .eq("trainer_id", trainerId)
    .order("scheduled_at", { ascending: true });

  if (!data || data.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in(
      "id",
      data.map((a) => a.student_id)
    );

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return data.map((appt) => ({ ...appt, studentName: nameMap.get(appt.student_id) ?? "Alumno" }));
}
