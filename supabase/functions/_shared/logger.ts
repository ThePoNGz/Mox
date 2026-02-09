import { createServiceClient } from "./db.ts";

export interface AILogEntry {
    userId: string;
    inputRedacted: string;
    outputRedacted: string;
    model: string;
    latencyMs: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
}

/**
 * Redacts sensitive content from AI logs
 * Keeps only the structure/intent, not the actual content
 */
function redactContent(content: string, maxLength = 50): string {
    if (!content) return "[empty]";

    // Show just enough to understand intent, but redact details
    const truncated = content.length > maxLength
        ? content.substring(0, maxLength) + "..."
        : content;

    // Replace potential PII patterns
    return truncated
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]")
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]")
        .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, "[DATE]");
}

/**
 * Logs AI usage to the ai_logs table
 * Uses service role to bypass RLS (only service role can insert)
 */
export async function logAIUsage(entry: AILogEntry): Promise<void> {
    try {
        const supabase = createServiceClient();

        const { error } = await supabase.from("ai_logs").insert({
            user_id: entry.userId,
            input_redacted: redactContent(entry.inputRedacted),
            output_redacted: redactContent(entry.outputRedacted),
            model: entry.model,
            latency: entry.latencyMs,
            input_tokens: entry.inputTokens,
            output_tokens: entry.outputTokens,
            total_tokens: entry.totalTokens,
        });

        if (error) {
            console.error("Failed to log AI usage:", error.message);
        }
    } catch (err) {
        // Don't let logging failures break the main flow
        console.error("AI logging error:", err);
    }
}

/**
 * Creates a structured logger for Edge Functions
 */
export function createLogger(name: string) {
    return {
        info: (message: string, data?: Record<string, unknown>) => {
            console.log(`[${name}] INFO:`, message, data ? JSON.stringify(data) : "");
        },
        warn: (message: string, data?: Record<string, unknown>) => {
            console.warn(`[${name}] WARN:`, message, data ? JSON.stringify(data) : "");
        },
        error: (message: string, data?: Record<string, unknown>) => {
            console.error(`[${name}] ERROR:`, message, data ? JSON.stringify(data) : "");
        },
    };
}
