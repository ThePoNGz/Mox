-- =============================================
-- DB Maintenance: Triggers + pg_cron Cleanup
-- =============================================

-- 1. Add updated_at column to events and tasks tables
alter table public.events add column if not exists updated_at timestamptz default now();
alter table public.tasks add column if not exists updated_at timestamptz default now();

-- 2. Create triggers to auto-update updated_at on row modification
-- Note: The handle_updated_at() function already exists in 0000_initial_schema.sql

create trigger on_events_updated
  before update on public.events
  for each row execute procedure public.handle_updated_at();

create trigger on_tasks_updated
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

-- =============================================
-- 3. pg_cron job to delete ai_logs older than 30 days
-- This protects user privacy by enforcing a retention policy.
-- =============================================

-- Enable pg_cron extension (Supabase hosted has this available)
create extension if not exists pg_cron;

-- Schedule the cleanup job to run daily at 03:00 UTC
select cron.schedule(
  'cleanup-ai-logs-older-than-30-days',  -- job name
  '0 3 * * *',                            -- cron schedule: daily at 03:00 UTC
  $$delete from public.ai_logs where created_at < now() - interval '30 days'$$
);
