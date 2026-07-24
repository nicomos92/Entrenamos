-- EntrenaMos - Agregar duracion a los turnos
-- Correr DESPUES de la migration 0009.

alter table public.appointments add column if not exists duration_minutes integer not null default 60;
