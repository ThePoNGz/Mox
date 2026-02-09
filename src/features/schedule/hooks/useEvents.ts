import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { scheduleKeys } from '../keys';
import { Event } from '../types';

export const useEvents = () => {
    return useQuery({
        queryKey: scheduleKeys.lists(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('starts_at', { ascending: true });

            if (error) throw error;
            return data;
        },
    });
};

export const useCreateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newEvent: Event) => {
            const { data, error } = await supabase
                .from('events')
                .insert(newEvent as any) // Type assertion until specific generated types are ready
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
        },
    });
};
