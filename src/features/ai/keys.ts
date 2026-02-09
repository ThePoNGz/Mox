export const aiKeys = {
    all: ['ai'] as const,
    suggestions: () => [...aiKeys.all, 'suggestions'] as const,
};
