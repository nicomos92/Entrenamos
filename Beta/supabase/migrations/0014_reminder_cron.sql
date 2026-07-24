-- ⚠️ Requisitos: habilitar pg_cron + pg_net desde Supabase Dashboard
--    Project Settings → Database → Extensions → activar pg_cron y pg_net

-- Reemplazar PROJECT_REF y SERVICE_KEY antes de ejecutar
select cron.schedule(
  'send-reminders',
  '0 * * * *',
  $$
    select net.http_post(
      url := 'https://PROJECT_REF.supabase.co/functions/v1/send-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer SERVICE_KEY'
      ),
      body := '{}'::jsonb
    )::text;
  $$
);
