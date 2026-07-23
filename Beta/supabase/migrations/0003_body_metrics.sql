-- EntrenaMos - Composicion corporal
-- Correr DESPUES de 0001_init.sql y 0002_admin_role.sql.

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (profile_id) on delete cascade,
  recorded_by uuid not null references public.profiles (id) on delete cascade,
  recorded_at date not null default current_date,
  weight_kg numeric(5,2),
  height_cm numeric(5,1),
  body_fat_pct numeric(4,1),
  muscle_mass_kg numeric(5,2),
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.body_metrics enable row level security;

create policy "body_metrics_select_own_or_trainer"
  on public.body_metrics for select
  using (
    student_id = auth.uid()
    or exists (select 1 from public.students s where s.profile_id = student_id and s.trainer_id = auth.uid())
  );

create policy "body_metrics_insert_self_or_trainer"
  on public.body_metrics for insert
  with check (
    recorded_by = auth.uid()
    and (
      student_id = auth.uid()
      or exists (select 1 from public.students s where s.profile_id = student_id and s.trainer_id = auth.uid())
    )
  );

create policy "body_metrics_delete_self_or_trainer"
  on public.body_metrics for delete
  using (
    student_id = auth.uid()
    or exists (select 1 from public.students s where s.profile_id = student_id and s.trainer_id = auth.uid())
  );

create index if not exists idx_body_metrics_student on public.body_metrics (student_id, recorded_at desc);
