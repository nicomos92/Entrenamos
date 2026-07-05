export type Role = "student" | "trainer";
export type StudentView = "home" | "workout" | "summary";
export type TrainerView = "trainer-dashboard" | "trainer-students" | "trainer-routines";
export type Status = "activo" | "inactivo";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  time?: string;
  rest: number;
  focus: string;
}

export interface Workout {
  id: string;
  name: string;
  estimatedMinutes: number;
  goal: string;
  exercises: Exercise[];
}

export interface User {
  id: string;
  name: string;
  assignedWorkoutId: string;
  status: Status;
  note: string;
  nextSession?: string;
  adherence: number;
  lastEffort: number;
}

export interface Session {
  id: string;
  userId: string;
  workoutId: string;
  completedExercises: number;
  totalExercises: number;
  effort: number;
  elapsedMinutes: number;
  status: "completada" | "incompleta";
}

export interface WeeklyProgress {
  done: number;
  goal: number;
  percentage: number;
}
