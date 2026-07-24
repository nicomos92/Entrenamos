-- EntrenaMos - Limpieza de ejercicios: quitar default_* que van en rutina
-- Correr DESPUES de la migration 0007.
-- Es seguro ejecutar múltiples veces.

-- 1. Eliminar columnas que pertenecen a routine_exercises, no a exercises
alter table public.exercises drop column if exists default_sets;
alter table public.exercises drop column if exists default_reps;
alter table public.exercises drop column if exists default_time;
alter table public.exercises drop column if exists default_rest;

-- 2. Nueva columna descripción
alter table public.exercises add column if not exists description text;

-- 3. Bucket de storage para imágenes/videos de ejercicios
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise_media',
  'exercise_media',
  true,
  10485760, -- 10 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;
