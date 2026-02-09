-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Events Table
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  notes text,
  location text,
  source text default 'manual',
  created_at timestamptz default now()
);

alter table public.events enable row level security;

create policy "Users can select own events"
  on public.events for select
  using (auth.uid() = user_id);

create policy "Users can insert own events"
  on public.events for insert
  with check (auth.uid() = user_id);

create policy "Users can update own events"
  on public.events for update
  using (auth.uid() = user_id);

create policy "Users can delete own events"
  on public.events for delete
  using (auth.uid() = user_id);

-- 2. Tasks Table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  status text default 'open',
  snoozed_until timestamptz,
  linked_event_id uuid references public.events(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Users can select own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 3. AI Logs Table
create table public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_redacted text,
  output_redacted text,
  model text,
  latency int,
  created_at timestamptz default now()
);

alter table public.ai_logs enable row level security;

create policy "Users can select own ai_logs"
  on public.ai_logs for select
  using (auth.uid() = user_id);

-- Only Service Role can insert (Edge Functions)
create policy "Service role can insert ai_logs"
  on public.ai_logs for insert
  with check (auth.role() = 'service_role');

-- Deny update/delete for everyone (implicit denial by lack of policy, but explicit for clarity)
-- No update/delete policies created.

-- 4. Entitlements Table
create table public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text check (status in ('active', 'trial', 'canceled', 'expired')),
  plan_id text,
  expires_at timestamptz,
  updated_at timestamptz default now()
);

alter table public.entitlements enable row level security;

create policy "Users can select own entitlements"
  on public.entitlements for select
  using (auth.uid() = user_id);

-- Only Service Role can insert/update (Webhooks)
create policy "Service role can insert entitlements"
  on public.entitlements for insert
  with check (auth.role() = 'service_role');

create policy "Service role can update entitlements"
  on public.entitlements for update
  using (auth.role() = 'service_role');

-- Trigger to update updated_at on entitlements
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_entitlements_updated
  before update on public.entitlements
  for each row execute procedure public.handle_updated_at();

