# AI Logic & Scheduling Reference

**Status**: Implemented ✅
**Date**: Feb 8, 2026
**Engine**: DeepSeek Chat (`deepseek-chat`)
**Key Feature**: Natural Language to Structured Event (with RRULE Recurrence)

## 1. Architecture

### Edge Function (`supabase/functions/ai-suggest`)
-   **Endpoint**: `POST /ai-suggest`
-   **Auth**: Requires valid Supabase JWT.
-   **Logic**:
    1.  Verifies Auth.
    2.  Calls DeepSeek API with `system` prompt + user `localTime`.
    3.  Parses JSON response.
    4.  **Logging**: Records usage in `ai_logs` (redacted PII).
    5.  **Action**: If valid event, inserts directly into `events` table.

### Database Schema
-   **Table**: `events`
    -   `source`: 'ai' (new column/value)
    -   `recurrence`: Stores **RRULE string** (RFC 5545).
    -   `all_day`: Boolean.
    -   `description`: Text.
    -   `location`: Text.
-   **Table**: `ai_logs`
    -   `input_redacted`: Prompt text.
    -   `output_redacted`: JSON response.
    -   `tokens_input`, `tokens_output`: Usage metrics.

## 2. Recurrence Logic (RRULE)
The AI outputs standard iCal RRULE strings.

| User Intent | RRULE Output |
| :--- | :--- |
| "Every day" | `FREQ=DAILY` |
| "Every weekday" | `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR` |
| "Every 2 weeks on Tuesday" | `FREQ=WEEKLY;INTERVAL=2;BYDAY=TU` |
| "Every Christmas" | `FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25` |

**Handling in Client**:
-   Use `rrule.js` (or similar) to parse these strings for display logic.
-   Stored in `events.recurrence` column.

## 3. Client Hook (`src/features/ai/hooks/useAISuggest.ts`)
-   **Function**: `generateSuggestion(prompt: string)`
-   **Returns**:
    -   `loading`: Boolean
    -   `error`: String | null
    -   `result`: The structured event or clarification question.

## 4. Maintenance
-   **Prompt Engineering**: Modify `buildSystemPrompt` in `index.ts` to change AI behavior.
-   **Model**: Currently `deepseek-chat` (Project `PLACEHOLDER_M8`).
-   **Privacy**: `ai_logs` are auto-cleaned after 30 days via `pg_cron`.
