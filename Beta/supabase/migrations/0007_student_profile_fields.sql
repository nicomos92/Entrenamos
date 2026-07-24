-- EntrenaMos - Campos extendidos del perfil del alumno
-- Correr DESPUES de las migrations 0001-0006.
-- Es seguro ejecutar este script múltiples veces (idempotente).

-- 0. Limpieza previa de student_schedules (tabla nueva, nadie la usa aún)
set lock_timeout to '2s';
drop policy if exists "student_schedules_select_own_or_trainer" on public.student_schedules;
drop policy if exists "student_schedules_insert_trainer" on public.student_schedules;
drop policy if exists "student_schedules_update_trainer" on public.student_schedules;
drop policy if exists "student_schedules_delete_trainer" on public.student_schedules;
drop table if exists public.student_schedules;

-- 1. Nuevas columnas en students (usa IF NOT EXISTS para evitar locks exclusivos innecesarios)
alter table public.students
  add column if not exists objetivo text,
  add column if not exists fecha_inicio date,
  add column if not exists fecha_nacimiento date,
  add column if not exists sexo text;

-- Limpieza de columna edad si existe de una versión anterior
alter table public.students drop column if exists edad;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'students_objetivo_check'
  ) then
    alter table public.students
      add constraint students_objetivo_check
      check (objetivo in ('Hipertrofia', 'Descenso de grasa', 'Fuerza', 'Salud', 'RendimientoDeportivo', 'Preparacion Fisica'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'students_sexo_check'
  ) then
    alter table public.students
      add constraint students_sexo_check
      check (sexo in ('masculino', 'femenino', 'otro'));
  end if;
end $$;

-- 2. Tabla de horarios semanales del alumno
create table if not exists public.student_schedules (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (profile_id) on delete cascade,
  dia_semana int not null check (dia_semana between 0 and 6),
  hora time not null,
  created_at timestamptz not null default now()
);

-- 3. RLS para student_schedules
alter table public.student_schedules enable row level security;

create policy "student_schedules_select_own_or_trainer"
  on public.student_schedules for select
  using (
    student_id = auth.uid()
    or exists (select 1 from public.students s where s.profile_id = student_id and s.trainer_id = auth.uid())
  );

create policy "student_schedules_insert_trainer"
  on public.student_schedules for insert
  with check (
    exists (select 1 from public.students s where s.profile_id = student_id and s.trainer_id = auth.uid())
  );

create policy "student_schedules_update_trainer"
  on public.student_schedules for update
  using (
    exists (select 1 from public.students s where s.profile_id = student_id and s.trainer_id = auth.uid())
  );

create policy "student_schedules_delete_trainer"
  on public.student_schedules for delete
  using (
    exists (select 1 from public.students s where s.profile_id = student_id and s.trainer_id = auth.uid())
  );

create index if not exists idx_student_schedules_student on public.student_schedules (student_id);

-- 4. Imagen y video para ejercicios
alter table public.exercises
  add column if not exists image_url text,
  add column if not exists video_url text;
