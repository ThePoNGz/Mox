-- Allow service role to insert events on behalf of users (for AI-created events)
-- Note: Service role already bypasses RLS, but this makes the intent explicit

create policy "Service role can insert events for users"
  on public.events for insert
  with check (auth.role() = 'service_role');

-- Add comment for documentation
comment on policy "Service role can insert events for users" on public.events 
  is 'Allows Edge Functions (using service role) to create events via AI suggestions';
