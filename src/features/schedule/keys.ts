export const scheduleKeys = {
    all: ['schedule'] as const,
    lists: () => [...scheduleKeys.all, 'list'] as const,
    list: (filters: string) => [...scheduleKeys.lists(), { filters }] as const,
    details: () => [...scheduleKeys.all, 'detail'] as const,
    detail: (id: string) => [...scheduleKeys.details(), id] as const,
};
