
import { config } from "../_shared/config.ts";
import { verifyAuthToken, createServiceClient } from "../_shared/db.ts";
import { logAIUsage } from "../_shared/logger.ts";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

// ============================================================================
// Type Definitions
// ============================================================================

interface AISuggestRequest {
    prompt: string;
    localTime: string;
    context?: {
        partial_event?: EventSuggestionData;
        previous_prompt?: string;
    };
}

interface EventSuggestionData {
    title: string | null;
    starts_at: string | null;
    duration: number | null;
    description: string | null;
    location: string | null;
    all_day: boolean;
    rrule: string | null;
}

interface EventCreatedResponse {
    type: "create_event";
    event: EventSuggestionData;
    message: string;
    missing_fields: string[];
}

interface ClarificationResponse {
    type: "ask_clarify";
    partial_event: EventSuggestionData;
    question: string;
    missing_required: string[];
}

interface ErrorResponse {
    type: "error";
    message: string;
}

type AIResponse = EventCreatedResponse | ClarificationResponse | ErrorResponse;

// ============================================================================
// System Prompt with Full RRULE Documentation
// ============================================================================

function buildSystemPrompt(localTime: string, context?: AISuggestRequest["context"]): string {
    const contextSection = context?.partial_event
        ? `\nPREVIOUS CONTEXT: The user was previously asked about: "${context.previous_prompt}"\nPartial event data: ${JSON.stringify(context.partial_event)}\n`
        : "";

    return `You are Mox, a smart calendar assistant. Parse natural language scheduling requests and return structured JSON with iCal RRULE for recurrence.

CURRENT USER LOCAL TIME: ${localTime}
${contextSection}

## RULES

1. **REQUIRED**: "starts_at" time is REQUIRED to create an event. If not specified, ask for clarification.
2. All other fields are OPTIONAL. Include them ONLY if the user explicitly mentions them.
3. Always return ALL fields in the event object, using null for unspecified optional fields.
4. For relative dates ("tomorrow", "next Monday"), calculate based on CURRENT USER LOCAL TIME.
5. Be friendly and conversational in your "message" field.
6. After creating an event, mention what's missing and offer to add more details.

## RRULE FORMAT (iCal RFC 5545)

RRULE is a string format for defining recurrence. Always output valid RRULE strings.

### Basic Frequency (FREQ=)
- FREQ=DAILY → Every day
- FREQ=WEEKLY → Every week
- FREQ=MONTHLY → Every month
- FREQ=YEARLY → Every year

### Interval (every N periods)
- FREQ=DAILY;INTERVAL=3 → Every 3 days
- FREQ=DAILY;INTERVAL=24 → Every 24 days
- FREQ=WEEKLY;INTERVAL=2 → Every 2 weeks
- FREQ=MONTHLY;INTERVAL=3 → Every 3 months (quarterly)

### Specific Days (BYDAY=)
Weekday codes: MO, TU, WE, TH, FR, SA, SU

- FREQ=WEEKLY;BYDAY=MO → Every Monday
- FREQ=WEEKLY;BYDAY=MO,WE,FR → Every Mon, Wed, Fri
- FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR → Every weekday
- FREQ=WEEKLY;BYDAY=SA,SU → Every weekend
- FREQ=WEEKLY;INTERVAL=2;BYDAY=TU → Every 2 weeks on Tuesday

### Specific Days of Month (BYMONTHDAY=)
- FREQ=MONTHLY;BYMONTHDAY=1 → 1st of every month
- FREQ=MONTHLY;BYMONTHDAY=15 → 15th of every month
- FREQ=MONTHLY;BYMONTHDAY=1,15 → 1st and 15th of every month
- FREQ=MONTHLY;BYMONTHDAY=-1 → Last day of every month

### Ordinal Weekdays (positional)
Format: BYDAY=<position><day> where position is 1-5 or -1 (last)

- FREQ=MONTHLY;BYDAY=1MO → First Monday of every month
- FREQ=MONTHLY;BYDAY=2TU → Second Tuesday of every month
- FREQ=MONTHLY;BYDAY=3TH → Third Thursday of every month
- FREQ=MONTHLY;BYDAY=4FR → Fourth Friday of every month
- FREQ=MONTHLY;BYDAY=-1FR → Last Friday of every month
- FREQ=MONTHLY;BYDAY=-1SU → Last Sunday of every month

### Yearly Events
- FREQ=YEARLY → Same date every year
- FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=14 → Every Feb 14 (Valentine's)
- FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25 → Every Dec 25 (Christmas)
- FREQ=YEARLY;BYMONTH=11;BYDAY=4TH → 4th Thursday of November (Thanksgiving US)

### End Conditions
- ;COUNT=10 → Stop after 10 occurrences
- ;UNTIL=20271231T235959Z → Stop on Dec 31, 2027 (UTC)

### Complex Examples
- "Every other Wednesday": FREQ=WEEKLY;INTERVAL=2;BYDAY=WE
- "First and third Monday": FREQ=MONTHLY;BYDAY=1MO,3MO
- "Every 90 days": FREQ=DAILY;INTERVAL=90
- "Quarterly on the 1st": FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=1

## RESPONSE FORMAT

### Event Created Successfully:
\`\`\`json
{
  "type": "create_event",
  "event": {
    "title": "Team Standup",
    "starts_at": "2026-02-09T09:00:00+07:00",
    "duration": 30,
    "description": null,
    "location": "Zoom",
    "all_day": false,
    "rrule": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
  },
  "message": "I've added 'Team Standup' every weekday at 9 AM for 30 minutes on Zoom. Would you like to add a description or set an end date?",
  "missing_fields": ["description"]
}
\`\`\`

### Need Clarification (no time given):
\`\`\`json
{
  "type": "ask_clarify",
  "partial_event": {
    "title": "Dentist",
    "starts_at": null,
    "duration": null,
    "description": null,
    "location": null,
    "all_day": false,
    "rrule": null
  },
  "question": "When would you like to schedule your dentist appointment?",
  "missing_required": ["starts_at"]
}
\`\`\`

## IMPORTANT REMINDERS

- Return ONLY valid JSON, no markdown code blocks in output.
- "starts_at" must be ISO 8601 with timezone offset from user's localTime.
- "duration" is in MINUTES when specified.
- "all_day" is true only if user says "all day", "whole day", etc.
- "rrule" is null for one-time events. Only set if user specifies recurrence.
- Always validate your RRULE output is syntactically correct.`;
}

// ============================================================================
// DeepSeek API Call
// ============================================================================

interface DeepSeekResult {
    response: AIResponse;
    model: string;
    usage: { input: number; output: number; total: number };
}

async function callDeepSeek(
    userPrompt: string,
    localTime: string,
    context?: AISuggestRequest["context"]
): Promise<DeepSeekResult> {
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");

    if (!apiKey) {
        throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
                { role: "system", content: buildSystemPrompt(localTime, context) },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.1, // Very low for consistent RRULE output
            max_tokens: 800,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        throw new Error(`DeepSeek API returned ${response.status}`);
    }

    const data = await response.json();

    const aiContent = data.choices?.[0]?.message?.content;
    if (!aiContent) {
        throw new Error("No content in DeepSeek response");
    }

    // Parse JSON response
    let parsedResponse: AIResponse;
    try {
        const cleanContent = aiContent
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        parsedResponse = JSON.parse(cleanContent);

        // Validate the response structure
        if (!parsedResponse.type) {
            throw new Error("Missing type field");
        }

        // Validate RRULE if present
        if (parsedResponse.type === "create_event" && parsedResponse.event.rrule) {
            if (!parsedResponse.event.rrule.includes("FREQ=")) {
                console.warn("Invalid RRULE detected, setting to null:", parsedResponse.event.rrule);
                parsedResponse.event.rrule = null;
            }
        }
    } catch (parseError) {
        console.error("Failed to parse DeepSeek response:", aiContent, parseError);
        parsedResponse = {
            type: "ask_clarify",
            partial_event: createEmptyEventData(),
            question: "I had trouble understanding that. Could you rephrase your scheduling request?",
            missing_required: ["starts_at"],
        };
    }

    return {
        response: parsedResponse,
        model: data.model || DEEPSEEK_MODEL,
        usage: {
            input: data.usage?.prompt_tokens || 0,
            output: data.usage?.completion_tokens || 0,
            total: data.usage?.total_tokens || 0,
        },
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

function createEmptyEventData(): EventSuggestionData {
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
// Main Handler
// ============================================================================

console.log("AI Suggest Function Initialized (RRULE Edition)");

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: config.corsHeaders });
    }

    const startTime = Date.now();

    try {
        // 1. Verify auth token
        const authHeader = req.headers.get("Authorization");
        const { userId } = await verifyAuthToken(authHeader);

        // 2. Parse request body
        const body: AISuggestRequest = await req.json();

        if (!body.prompt || typeof body.prompt !== "string") {
            throw new Error("Missing or invalid 'prompt' in request body");
        }

        if (!body.localTime || typeof body.localTime !== "string") {
            throw new Error("Missing or invalid 'localTime' in request body");
        }

        // 3. Call DeepSeek API
        const { response: aiResponse, model, usage } = await callDeepSeek(
            body.prompt,
            body.localTime,
            body.context
        );

        const latencyMs = Date.now() - startTime;

        // 4. Log usage (async, don't block response)
        logAIUsage({
            userId,
            inputRedacted: body.prompt,
            outputRedacted: JSON.stringify(aiResponse),
            model,
            latencyMs,
            inputTokens: usage.input,
            outputTokens: usage.output,
            totalTokens: usage.total,
        });

        // 5. If it's a create_event response, insert the event into the database
        if (aiResponse.type === "create_event" && aiResponse.event.starts_at) {
            const supabase = createServiceClient();
            const event = aiResponse.event;

            // Calculate ends_at only if duration is provided
            let endsAt: string | null = null;
            if (event.duration && event.starts_at) {
                const startsAtDate = new Date(event.starts_at);
                const endsAtDate = new Date(startsAtDate.getTime() + event.duration * 60 * 1000);
                endsAt = endsAtDate.toISOString();
            }

            const { error: insertError } = await supabase.from("events").insert({
                user_id: userId,
                title: event.title || "Untitled Event",
                starts_at: event.starts_at,
                ends_at: endsAt,
                description: event.description,
                location: event.location,
                all_day: event.all_day,
                recurrence: event.rrule, // Store RRULE string directly
                source: "ai",
            });

            if (insertError) {
                console.error("Failed to insert event:", insertError);
                return new Response(
                    JSON.stringify({
                        type: "error",
                        message: "I understood your request but failed to save the event. Please try again.",
                    } as ErrorResponse),
                    {
                        headers: { ...config.corsHeaders, "Content-Type": "application/json" },
                        status: 500,
                    }
                );
            }
        }

        // 6. Return the AI response
        return new Response(JSON.stringify(aiResponse), {
            headers: { ...config.corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        const status = message.includes("auth") || message.includes("token") ? 401 : 400;

        console.error("AI Suggest error:", message);

        return new Response(
            JSON.stringify({ type: "error", message } as ErrorResponse),
            {
                headers: { ...config.corsHeaders, "Content-Type": "application/json" },
                status,
            }
        );
    }
});
