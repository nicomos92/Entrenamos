-- EntrenaMos - Colores de marca del entrenador
-- Correr DESPUES de 0001, 0002, 0003 y 0004.

-- 1. Columnas para los dos colores de marca del entrenador (hex #RRGGBB).
alter table public.profiles add column if not exists brand_primary text;
alter table public.profiles add column if not exists brand_secondary text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_brand_primary_format'
  ) then
    alter table public.profiles
      add constraint profiles_brand_primary_format
      check (brand_primary is null or brand_primary ~ '^#[0-9A-Fa-f]{6}$');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_brand_secondary_format'
  ) then
    alter table public.profiles
      add constraint profiles_brand_secondary_format
      check (brand_secondary is null or brand_secondary ~ '^#[0-9A-Fa-f]{6}$');
  end if;
end $$;

-- 2. La RPC de branding cambia de forma (agrega columnas), hay que dropearla y recrearla.
drop function if exists public.get_student_trainer_branding(text);

create function public.get_student_trainer_branding(p_email text)
returns table (
  trainer_name text,
  logo_url text,
  brand_primary text,
  brand_secondary text
)
language sql
security definer
set search_path = public
stable
as $$
  select t.full_name, t.logo_url, t.brand_primary, t.brand_secondary
  from public.profiles s
  join public.students st on st.profile_id = s.id
  join public.profiles t on t.id = st.trainer_id
  where s.email = p_email and s.role = 'student'
  limit 1;
$$;

grant execute on function public.get_student_trainer_branding(text) to anon, authenticated;
