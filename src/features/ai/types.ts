/**
 * AI Feature Types
 * 
 * Types for AI-powered event suggestions using iCal RRULE standard.
 */

// ============================================================================
// Event Suggestion Types
// ============================================================================

/**
 * Complete event data structure returned by AI
 * All fields are always present; null means user didn't specify
 */
export interface EventSuggestionData {
    /** Event title - null if user didn't provide one */
    title: string | null;
    /** Start time as ISO 8601 timestamp - null if user didn't specify time */
    starts_at: string | null;
    /** Duration in minutes - null if not specified */
    duration: number | null;
    /** Event description/notes - null if not provided */
    description: string | null;
    /** Location/place - null if not specified */
    location: string | null;
    /** Whether it's an all-day event */
    all_day: boolean;
    /** 
     * iCal RRULE string for recurrence - null if not recurring
     * Examples:
     * - "FREQ=DAILY" → Every day
     * - "FREQ=WEEKLY;BYDAY=MO,WE,FR" → Mon/Wed/Fri
     * - "FREQ=MONTHLY;BYDAY=3TH" → 3rd Thursday of month
     * - "FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25" → Every Christmas
     */
    rrule: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Successful event creation response
 * Event is automatically inserted into the database
 */
export interface EventCreatedResponse {
    type: 'create_event';
    /** The event data that was created */
    event: EventSuggestionData;
    /** Friendly message to show in chat */
    message: string;
    /** List of fields that were not specified by user (for follow-up) */
    missing_fields: string[];
}

/**
 * AI needs more information before creating the event
 */
export interface ClarificationResponse {
    type: 'ask_clarify';
    /** Partially filled event data (what we understood so far) */
    partial_event: EventSuggestionData;
    /** Question to ask the user */
    question: string;
    /** Which field(s) need clarification */
    missing_required: string[];
}

/**
 * Error response
 */
export interface ErrorResponse {
    type: 'error';
    message: string;
}

/**
 * Union of all possible AI response types
 */
export type AISuggestResponse = EventCreatedResponse | ClarificationResponse | ErrorResponse;

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request body for the ai-suggest Edge Function
 */
export interface AISuggestRequest {
    /** User's natural language prompt */
    prompt: string;
    /** User's current local time in ISO 8601 format */
    localTime: string;
    /** Optional: previous context for multi-turn conversation */
    context?: {
        /** Previous partial event from a clarification response */
        partial_event?: EventSuggestionData;
        /** Previous messages for context */
        previous_prompt?: string;
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates an empty/default EventSuggestionData object
 */
export function createEmptyEventData(): EventSuggestionData {
    return {
        title: null,
        starts_at: null,
        duration: null,
        description: null,
        location: null,
        all_day: false,
        rrule: null,
    };
}

// ============================================================================
// RRULE Constants & Helpers
// ============================================================================

/**
 * Common RRULE presets for quick selection
 */
export const RRULE_PRESETS = {
    /** No recurrence */
    NONE: null,
    /** Every day */
    DAILY: 'FREQ=DAILY',
    /** Every weekday (Mon-Fri) */
    WEEKDAYS: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
    /** Every weekend (Sat-Sun) */
    WEEKENDS: 'FREQ=WEEKLY;BYDAY=SA,SU',
    /** Every week (same day) */
    WEEKLY: 'FREQ=WEEKLY',
    /** Every 2 weeks */
    BIWEEKLY: 'FREQ=WEEKLY;INTERVAL=2',
    /** Every month (same day) */
    MONTHLY: 'FREQ=MONTHLY',
    /** Every year (same date) */
    YEARLY: 'FREQ=YEARLY',
} as const;

/**
 * Weekday codes for RRULE BYDAY parameter
 */
export const RRULE_DAYS = {
    SUNDAY: 'SU',
    MONDAY: 'MO',
    TUESDAY: 'TU',
    WEDNESDAY: 'WE',
    THURSDAY: 'TH',
    FRIDAY: 'FR',
    SATURDAY: 'SA',
} as const;

/**
 * Validates if a string is a valid RRULE
 * Basic validation - checks for required FREQ parameter
 */
export function isValidRRule(rrule: string | null): boolean {
    if (!rrule) return true; // null is valid (no recurrence)
    return rrule.includes('FREQ=');
}

/**
 * Parses RRULE string and returns human-readable description
 * Note: For full parsing, consider using a library like 'rrule' on the client
 */
export function describeRRule(rrule: string | null): string {
    if (!rrule) return 'Does not repeat';

    // Basic parsing for common patterns
    if (rrule === 'FREQ=DAILY') return 'Every day';
    if (rrule === 'FREQ=WEEKLY') return 'Every week';
    if (rrule === 'FREQ=MONTHLY') return 'Every month';
    if (rrule === 'FREQ=YEARLY') return 'Every year';
    if (rrule.includes('BYDAY=MO,TU,WE,TH,FR')) return 'Every weekday';
    if (rrule.includes('BYDAY=SA,SU')) return 'Every weekend';

    // For complex rules, return the raw RRULE
    // The UI can use a proper rrule library for full parsing
    return `Repeats: ${rrule}`;
}
