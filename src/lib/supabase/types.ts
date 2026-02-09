export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            events: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    starts_at: string
                    ends_at: string | null
                    notes: string | null
                    location: string | null
                    source: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    starts_at: string
                    ends_at?: string | null
                    notes?: string | null
                    location?: string | null
                    source?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    starts_at?: string
                    ends_at?: string | null
                    notes?: string | null
                    location?: string | null
                    source?: string
                    created_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    due_at: string | null
                    status: string
                    snoozed_until: string | null
                    linked_event_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    due_at?: string | null
                    status?: string
                    snoozed_until?: string | null
                    linked_event_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    due_at?: string | null
                    status?: string
                    snoozed_until?: string | null
                    linked_event_id?: string | null
                    created_at?: string
                }
            }
        }
    }
}
