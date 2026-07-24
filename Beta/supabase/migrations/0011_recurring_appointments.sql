-- EntrenaMos - Turnos recurrentes
-- Correr DESPUES de la migration 0010.

alter table public.appointments add column if not exists recurring_group_id uuid;
alter table public.appointments add column if not exists recurring_rule text;
-- recurring_rule ej: "weekly", "biweekly"

create index if not exists idx_appointments_recurring_group
  on public.appointments (recurring_group_id);
