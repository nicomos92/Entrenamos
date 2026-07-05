import { User, Session } from "@/app/types";

export const users: User[] = [
  {
    id: "u1",
    name: "Nicolas",
    assignedWorkoutId: "full-body-a",
    status: "activo",
    note: "Buen ritmo esta semana",
    nextSession: "Hoy",
    adherence: 92,
    lastEffort: 4,
  },
  {
    id: "u2",
    name: "Lucia Rojas",
    assignedWorkoutId: "full-body-a",
    status: "activo",
    note: "Controlar fatiga",
    nextSession: "Hoy 18:00",
    adherence: 88,
    lastEffort: 5,
  },
  {
    id: "u3",
    name: "Carlos Mendez",
    assignedWorkoutId: "mobility-b",
    status: "inactivo",
    note: "Reactivar seguimiento",
    adherence: 46,
    lastEffort: 2,
  },
  {
    id: "u4",
    name: "Maria Garcia",
    assignedWorkoutId: "full-body-a",
    status: "activo",
    note: "Alta adherencia",
    nextSession: "Manana",
    adherence: 97,
    lastEffort: 3,
  },
];

export const sessions: Session[] = [
  { id: "s1", userId: "u1", workoutId: "full-body-a", completedExercises: 3, totalExercises: 3, effort: 4, elapsedMinutes: 39, status: "completada" },
  { id: "s2", userId: "u2", workoutId: "full-body-a", completedExercises: 2, totalExercises: 3, effort: 5, elapsedMinutes: 31, status: "incompleta" },
  { id: "s3", userId: "u4", workoutId: "full-body-a", completedExercises: 3, totalExercises: 3, effort: 3, elapsedMinutes: 41, status: "completada" },
];

export const currentUser = users[0];
