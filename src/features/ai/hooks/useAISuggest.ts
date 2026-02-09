import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { config } from '@/lib/config';
import type { AISuggestRequest, AISuggestResponse } from '../types';
import { scheduleKeys } from '@/features/schedule/keys';

/**
 * Calls the ai-suggest Edge Function
 */
async function callAISuggest(request: AISuggestRequest): Promise<AISuggestResponse> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(
        `${config.supabaseUrl}/functions/v1/ai-suggest`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': config.supabaseAnonKey,
            },
            body: JSON.stringify(request),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Hook for sending prompts to the AI suggestion service
 * 
 * @example
 * ```tsx
 * const { mutate: sendPrompt, isPending, data } = useAISuggest();
 * 
 * const handleSend = (prompt: string) => {
 *   sendPrompt({
 *     prompt,
 *     localTime: new Date().toISOString(),
 *   });
 * };
 * 
 * // Handle response
 * if (data?.type === 'create_event') {
 *   // Event was created, show success message
 *   console.log(data.message);
 *   console.log('Created event:', data.event);
 * } else if (data?.type === 'ask_clarify') {
 *   // AI needs more info
 *   console.log(data.question);
 * }
 * ```
 */
export function useAISuggest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: callAISuggest,
        onSuccess: (data: AISuggestResponse) => {
            // If an event was created, invalidate the schedule queries to refresh the calendar
            if (data.type === 'create_event') {
                queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
            }
        },
        onError: (error: Error) => {
            console.error('AI Suggest error:', error);
        },
    });
}

/**
 * Helper to get current local time in ISO format
 * Use this when calling useAISuggest
 */
export function getCurrentLocalTime(): string {
    return new Date().toISOString();
}
