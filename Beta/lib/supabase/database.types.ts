// Tipos manuales que reflejan supabase/migrations/*.sql.
// Si el schema cambia, actualizar este archivo (o generarlo con
// `supabase gen types typescript` cuando tengas la CLI conectada).

export type Role = "admin" | "trainer" | "student";
export type StudentStatus = "activo" | "inactivo";
export type SessionStatus = "completada" | "incompleta";
export type AppointmentStatus = "pendiente" | "confirmado" | "cancelado" | "completado";
export type Objetivo = "Hipertrofia" | "Descenso de grasa" | "Fuerza" | "Salud" | "RendimientoDeportivo" | "Preparacion Fisica";
export type Sexo = "masculino" | "femenino" | "otro";

export const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;

export interface StudentSchedule {
  id: string;
  student_id: string;
  dia_semana: number;
  hora: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Role;
          full_name: string;
          email: string;
          logo_url: string | null;
          brand_primary: string | null;
          brand_secondary: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: Role;
          full_name: string;
          email: string;
          logo_url?: string | null;
          brand_primary?: string | null;
          brand_secondary?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          role: Role;
          full_name: string;
          email: string;
          logo_url: string | null;
          brand_primary: string | null;
          brand_secondary: string | null;
        }>;
        Relationships: [];
      };
      students: {
        Row: {
          profile_id: string;
          trainer_id: string;
          status: StudentStatus;
          note: string;
          objetivo: string | null;
          fecha_inicio: string | null;
          fecha_nacimiento: string | null;
          sexo: string | null;
          created_at: string;
        };
        Insert: {
          profile_id: string;
          trainer_id: string;
          status?: StudentStatus;
          note?: string;
          objetivo?: string | null;
          fecha_inicio?: string | null;
          fecha_nacimiento?: string | null;
          sexo?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          status: StudentStatus;
          note: string;
          objetivo: string | null;
          fecha_inicio: string | null;
          fecha_nacimiento: string | null;
          sexo: string | null;
        }>;
        Relationships: [
          {
            foreignKeyName: "students_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "students_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          id: string;
          trainer_id: string;
          name: string;
          description: string | null;
          focus: string;
          image_url: string | null;
          video_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          name: string;
          description?: string | null;
          focus?: string;
          image_url?: string | null;
          video_url?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          description: string | null;
          focus: string;
          image_url: string | null;
          video_url: string | null;
        }>;
        Relationships: [
          {
            foreignKeyName: "exercises_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      routines: {
        Row: {
          id: string;
          trainer_id: string;
          name: string;
          goal: string;
          estimated_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          name: string;
          goal?: string;
          estimated_minutes?: number;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          goal: string;
          estimated_minutes: number;
        }>;
        Relationships: [
          {
            foreignKeyName: "routines_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      routine_exercises: {
        Row: {
          id: string;
          routine_id: string;
          exercise_id: string;
          order_index: number;
          sets: number;
          reps: number | null;
          time: string | null;
          rest: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          routine_id: string;
          exercise_id: string;
          order_index?: number;
          sets?: number;
          reps?: number | null;
          time?: string | null;
          rest?: number;
          created_at?: string;
        };
        Update: Partial<{
          order_index: number;
          sets: number;
          reps: number | null;
          time: string | null;
          rest: number;
        }>;
        Relationships: [
          {
            foreignKeyName: "routine_exercises_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      assignments: {
        Row: {
          id: string;
          trainer_id: string;
          student_id: string;
          routine_id: string;
          active: boolean;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          student_id: string;
          routine_id: string;
          active?: boolean;
          assigned_at?: string;
        };
        Update: Partial<{
          active: boolean;
        }>;
        Relationships: [
          {
            foreignKeyName: "assignments_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "assignments_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          id: string;
          student_id: string;
          routine_id: string;
          assignment_id: string | null;
          effort: number | null;
          elapsed_minutes: number | null;
          status: SessionStatus;
          coach_note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          routine_id: string;
          assignment_id?: string | null;
          effort?: number | null;
          elapsed_minutes?: number | null;
          status?: SessionStatus;
          coach_note?: string;
          created_at?: string;
        };
        Update: Partial<{
          effort: number | null;
          elapsed_minutes: number | null;
          status: SessionStatus;
          coach_note: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "sessions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "sessions_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignments";
            referencedColumns: ["id"];
          },
        ];
      };
      session_exercises: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise_id: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          completed: boolean;
        }>;
        Relationships: [
          {
            foreignKeyName: "session_exercises_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          trainer_id: string;
          student_id: string;
          scheduled_at: string;
          status: AppointmentStatus;
          notes: string;
          duration_minutes: number;
          recurring_group_id: string | null;
          recurring_rule: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          student_id: string;
          scheduled_at: string;
          status?: AppointmentStatus;
          notes?: string;
          duration_minutes?: number;
          recurring_group_id?: string | null;
          recurring_rule?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          scheduled_at: string;
          status: AppointmentStatus;
          notes: string;
          duration_minutes: number;
        }>;
        Relationships: [
          {
            foreignKeyName: "appointments_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      body_metrics: {
        Row: {
          id: string;
          student_id: string;
          recorded_by: string;
          recorded_at: string;
          weight_kg: number | null;
          height_cm: number | null;
          body_fat_pct: number | null;
          muscle_mass_kg: number | null;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          recorded_by: string;
          recorded_at?: string;
          weight_kg?: number | null;
          height_cm?: number | null;
          body_fat_pct?: number | null;
          muscle_mass_kg?: number | null;
          notes?: string;
          created_at?: string;
        };
        Update: Partial<{
          recorded_at: string;
          weight_kg: number | null;
          height_cm: number | null;
          body_fat_pct: number | null;
          muscle_mass_kg: number | null;
          notes: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "body_metrics_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "body_metrics_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      student_schedules: {
        Row: {
          id: string;
          student_id: string;
          dia_semana: number;
          hora: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          dia_semana: number;
          hora: string;
          created_at?: string;
        };
        Update: Partial<{
          dia_semana: number;
          hora: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "student_schedules_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data: Record<string, unknown>;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string;
          data?: Record<string, unknown>;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          read: boolean;
        }>;
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_student_trainer_branding: {
        Args: { p_email: string };
        Returns: {
          trainer_name: string;
          logo_url: string | null;
          brand_primary: string | null;
          brand_secondary: string | null;
        }[];
      };
    };
  };
}
