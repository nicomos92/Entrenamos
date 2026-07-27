-- Feedback por ejercicio (dificultad + nota)
alter table public.session_exercises
add column if not exists difficulty int check (difficulty between 1 and 5),
add column if not exists notes text;

-- Log de series reales por ejercicio
create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references public.session_exercises (id) on delete cascade,
  set_number int not null,
  weight_kg numeric(6,2),
  reps int,
  rpe numeric(2,1) check (rpe between 1 and 10),
  created_at timestamptz not null default now()
);

alter table public.exercise_sets enable row level security;

create policy "exercise_sets_select_owner"
  on public.exercise_sets for select
  using (
    exists (
      select 1 from public.session_exercises se
      join public.sessions s on s.id = se.session_id
      where se.id = session_exercise_id
      and (s.student_id = auth.uid())
    )
    or exists (
      select 1 from public.session_exercises se
      join public.sessions s on s.id = se.session_id
      join public.students st on st.profile_id = s.student_id
      where se.id = session_exercise_id
      and st.trainer_id = auth.uid()
    )
  );

create policy "exercise_sets_insert_student"
  on public.exercise_sets for insert
  with check (
    exists (
      select 1 from public.session_exercises se
      join public.sessions s on s.id = se.session_id
      where se.id = session_exercise_id
      and s.student_id = auth.uid()
    )
  );

create index if not exists idx_exercise_sets_session_exercise on public.exercise_sets (session_exercise_id, set_number);
