/**
 * Query Keys for Subscription Feature
 * Used with TanStack Query for cache management
 */

export const subscriptionKeys = {
    /** All subscription-related queries */
    all: ['subscription'] as const,

    /** Customer info from RevenueCat */
    customerInfo: () => [...subscriptionKeys.all, 'customerInfo'] as const,

    /** Available offerings */
    offerings: () => [...subscriptionKeys.all, 'offerings'] as const,

    /** Entitlement from database */
    entitlement: (userId: string) => [...subscriptionKeys.all, 'entitlement', userId] as const,

    /** Pro access status */
    proAccess: () => [...subscriptionKeys.all, 'proAccess'] as const,
};
