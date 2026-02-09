import { z } from 'zod';

export const EventSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid().optional(), // Handled by RLS/Auth
    title: z.string().min(1, 'Title is required'),
    starts_at: z.string().datetime(), // ISO string from DB
    ends_at: z.string().datetime().nullable().optional(),
    notes: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    source: z.enum(['manual', 'ai']).default('manual'),
    created_at: z.string().datetime().optional(),
});

export type Event = z.infer<typeof EventSchema>;
