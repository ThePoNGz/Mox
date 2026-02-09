-- Add all_day and recurrence columns to events table
alter table public.events 
  add column if not exists all_day boolean default false,
  add column if not exists description text,
  add column if not exists recurrence jsonb;

-- Add comments for documentation
comment on column public.events.all_day is 'If true, the event spans the entire day (no specific time)';
comment on column public.events.description is 'Detailed description/notes for the event';
comment on column public.events.recurrence is 'JSON object defining recurrence pattern: { type, interval, weekdays, monthDays, endDate }';

-- Note: We keep 'notes' column for backward compatibility, but 'description' is the preferred field going forward

/*
Recurrence JSON Schema:
{
  "type": "none" | "daily" | "weekly" | "monthly",
  "interval": 1,           // repeat every N (days/weeks/months)
  "weekdays": [1, 3, 5],   // for weekly: 0=Sun, 1=Mon, ..., 6=Sat
  "monthDays": [1, 15],    // for monthly: which days of month (1-31)
  "endDate": "2026-12-31"  // optional: when to stop recurring (ISO date)
}

Examples:
- Every day: { "type": "daily", "interval": 1 }
- Every weekday: { "type": "weekly", "interval": 1, "weekdays": [1,2,3,4,5] }
- Every Monday and Friday: { "type": "weekly", "interval": 1, "weekdays": [1,5] }
- Every 2 weeks on Tuesday: { "type": "weekly", "interval": 2, "weekdays": [2] }
- 1st and 15th of each month: { "type": "monthly", "interval": 1, "monthDays": [1,15] }
- Every 3 months on the 1st: { "type": "monthly", "interval": 3, "monthDays": [1] }
*/
