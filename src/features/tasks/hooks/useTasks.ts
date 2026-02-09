import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { taskKeys } from '../keys';
import { Task } from '../types';

export const useTasks = () => {
    return useQuery({
        queryKey: taskKeys.lists(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTask: Task) => {
            const { data, error } = await supabase
                .from('tasks')
                .insert(newTask as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
};
