-- Change recurrence column from JSONB to TEXT for RRULE strings
-- If the column was already created as JSONB, alter it

DO $$
BEGIN
  -- Check if recurrence column exists and is jsonb, then change to text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'recurrence' 
    AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE public.events ALTER COLUMN recurrence TYPE text USING recurrence::text;
  END IF;
END $$;

-- Add comment explaining RRULE format
comment on column public.events.recurrence is 'iCal RRULE string for recurrence (e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR). See RFC 5545.';

/*
RRULE Examples:
- FREQ=DAILY                           → Every day
- FREQ=DAILY;INTERVAL=3                → Every 3 days
- FREQ=WEEKLY;BYDAY=MO,WE,FR           → Every Mon/Wed/Fri
- FREQ=WEEKLY;INTERVAL=2;BYDAY=TU      → Every 2 weeks on Tuesday
- FREQ=MONTHLY;BYMONTHDAY=1,15         → 1st and 15th of each month
- FREQ=MONTHLY;BYDAY=3TH               → 3rd Thursday of each month
- FREQ=MONTHLY;BYDAY=-1FR              → Last Friday of each month
- FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=8   → Every Feb 8th
- FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25 → Every Christmas
- Append ;COUNT=10                      → Stop after 10 occurrences
- Append ;UNTIL=20270331T235959Z        → Stop on specific date
*/
