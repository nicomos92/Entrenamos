-- EntrenaMos - Sistema de notificaciones
-- Correr DESPUES de la migration 0011.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'appointment_created',
    'appointment_updated',
    'appointment_cancelled',
    'appointment_reminder',
    'routine_assigned',
    'session_completed',
    'metric_recorded'
  )),
  title text not null,
  body text not null default '',
  data jsonb default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread
  on public.notifications (user_id, read)
  where read = false;

create index if not exists idx_notifications_user_recent
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifications_insert_system"
  on public.notifications for insert
  with check (true);
