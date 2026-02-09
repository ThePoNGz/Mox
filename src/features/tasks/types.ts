import { z } from 'zod';

export const TaskSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid().optional(),
    title: z.string().min(1, 'Title is required'),
    due_at: z.string().datetime().nullable().optional(),
    status: z.enum(['open', 'completed']).default('open'),
    snoozed_until: z.string().datetime().nullable().optional(),
    linked_event_id: z.string().uuid().nullable().optional(),
    created_at: z.string().datetime().optional(),
});

export type Task = z.infer<typeof TaskSchema>;
