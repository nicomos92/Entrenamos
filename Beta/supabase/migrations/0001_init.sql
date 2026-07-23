-- EntrenaMos - Schema inicial
-- Correr en el SQL Editor de Supabase (o via `supabase db push` si usas la CLI).
--
-- Estructura en dos fases para evitar referencias hacia adelante:
--   Fase 1: se crean TODAS las tablas (en orden de dependencias de FKs).
--   Fase 2: se activa RLS y se crean TODAS las policies (ya con todas las
--           tablas existentes, así las policies pueden referenciarse entre sí
--           sin importar el orden).

-- =========================================================
-- FASE 1: TABLAS
-- =========================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('trainer', 'student')),
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- 2. STUDENTS
create table if not exists public.students (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'activo' check (status in ('activo', 'inactivo')),
  note text not null default '',
  created_at timestamptz not null default now()
);

-- 3. EXERCISES
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  default_sets int not null default 3,
  default_reps int,
  default_time text,
  default_rest int not null default 60,
  focus text not null default '',
  created_at timestamptz not null default now()
);

-- 4. ROUTINES
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  goal text not null default '',
  estimated_minutes int not null default 30,
  created_at timestamptz not null default now()
);

-- 5. ROUTINE_EXERCISES (detalle de una rutina)
create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  order_index int not null default 0,
  sets int not null default 3,
  reps int,
  time text,
  rest int not null default 60,
  created_at timestamptz not null default now()
);

-- 6. ASSIGNMENTS (rutina asignada a un alumno)
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.students (profile_id) on delete cascade,
  routine_id uuid not null references public.routines (id) on delete cascade,
  active boolean not null default true,
  assigned_at timestamptz not null default now()
);

-- 7. SESSIONS (entrenamiento registrado por el alumno)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (profile_id) on delete cascade,
  routine_id uuid not null references public.routines (id) on delete cascade,
  assignment_id uuid references public.assignments (id) on delete set null,
  effort int check (effort between 1 and 5),
  elapsed_minutes int,
  status text not null default 'incompleta' check (status in ('completada', 'incompleta')),
  coach_note text not null default '',
  created_at timestamptz not null default now()
);

-- 8. SESSION_EXERCISES (detalle de ejercicios completados)
create table if not exists public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. APPOINTMENTS (agenda de turnos)
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.students (profile_id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'confirmado', 'cancelado', 'completado')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- Trigger: crea automaticamente el profile cuando se crea un auth.users.
-- El rol y nombre vienen del user_metadata pasado al crear el usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- FASE 2: RLS + POLICIES
-- Todas las tablas ya existen, así que las policies pueden
-- referenciarse entre sí sin importar el orden.
-- =========================================================

-- 1. PROFILES
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_trainer"
  on public.profiles for select
  using (
    id = auth.uid()
    or id in (select profile_id from public.students where trainer_id = auth.uid())
  );

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

-- 2. STUDENTS
alter table public.students enable row level security;

create policy "students_select_own_or_trainer"
  on public.students for select
  using (profile_id = auth.uid() or trainer_id = auth.uid());

create policy "students_insert_trainer"
  on public.students for insert
  with check (trainer_id = auth.uid());

create policy "students_update_trainer"
  on public.students for update
  using (trainer_id = auth.uid());

create policy "students_delete_trainer"
  on public.students for delete
  using (trainer_id = auth.uid());

-- 3. EXERCISES
alter table public.exercises enable row level security;

create policy "exercises_all_trainer"
  on public.exercises for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

-- Los alumnos necesitan poder leer ejercicios que forman parte de una rutina asignada.
create policy "exercises_select_assigned_student"
  on public.exercises for select
  using (
    exists (
      select 1
      from public.routine_exercises re
      join public.assignments a on a.routine_id = re.routine_id
      where re.exercise_id = exercises.id
        and a.student_id = auth.uid()
        and a.active
    )
  );

-- 4. ROUTINES
alter table public.routines enable row level security;

create policy "routines_all_trainer"
  on public.routines for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "routines_select_assigned_student"
  on public.routines for select
  using (
    exists (
      select 1 from public.assignments a
      where a.routine_id = routines.id
        and a.student_id = auth.uid()
        and a.active
    )
  );

-- 5. ROUTINE_EXERCISES
alter table public.routine_exercises enable row level security;

create policy "routine_exercises_all_trainer"
  on public.routine_exercises for all
  using (
    exists (select 1 from public.routines r where r.id = routine_id and r.trainer_id = auth.uid())
  )
  with check (
    exists (select 1 from public.routines r where r.id = routine_id and r.trainer_id = auth.uid())
  );

create policy "routine_exercises_select_assigned_student"
  on public.routine_exercises for select
  using (
    exists (
      select 1 from public.assignments a
      where a.routine_id = routine_exercises.routine_id
        and a.student_id = auth.uid()
        and a.active
    )
  );

-- 6. ASSIGNMENTS
alter table public.assignments enable row level security;

create policy "assignments_select_own_or_trainer"
  on public.assignments for select
  using (trainer_id = auth.uid() or student_id = auth.uid());

create policy "assignments_write_trainer"
  on public.assignments for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

-- 7. SESSIONS
alter table public.sessions enable row level security;

create policy "sessions_select_own_or_trainer"
  on public.sessions for select
  using (
    student_id = auth.uid()
    or exists (select 1 from public.students s where s.profile_id = student_id and s.trainer_id = auth.uid())
  );

create policy "sessions_write_student"
  on public.sessions for insert
  with check (student_id = auth.uid());

create policy "sessions_update_student"
  on public.sessions for update
  using (student_id = auth.uid());

-- 8. SESSION_EXERCISES
alter table public.session_exercises enable row level security;

create policy "session_exercises_select_own_or_trainer"
  on public.session_exercises for select
  using (
    exists (
      select 1 from public.sessions se
      where se.id = session_id
        and (
          se.student_id = auth.uid()
          or exists (select 1 from public.students s where s.profile_id = se.student_id and s.trainer_id = auth.uid())
        )
    )
  );

create policy "session_exercises_write_student"
  on public.session_exercises for all
  using (
    exists (select 1 from public.sessions se where se.id = session_id and se.student_id = auth.uid())
  )
  with check (
    exists (select 1 from public.sessions se where se.id = session_id and se.student_id = auth.uid())
  );

-- 9. APPOINTMENTS
alter table public.appointments enable row level security;

create policy "appointments_select_own_or_trainer"
  on public.appointments for select
  using (trainer_id = auth.uid() or student_id = auth.uid());

create policy "appointments_write_trainer"
  on public.appointments for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

-- =========================================================
-- Indices utiles
-- =========================================================
create index if not exists idx_students_trainer on public.students (trainer_id);
create index if not exists idx_exercises_trainer on public.exercises (trainer_id);
create index if not exists idx_routines_trainer on public.routines (trainer_id);
create index if not exists idx_routine_exercises_routine on public.routine_exercises (routine_id);
create index if not exists idx_assignments_student on public.assignments (student_id);
create index if not exists idx_assignments_routine on public.assignments (routine_id);
create index if not exists idx_sessions_student on public.sessions (student_id);
create index if not exists idx_appointments_trainer on public.appointments (trainer_id);
create index if not exists idx_appointments_student on public.appointments (student_id);
