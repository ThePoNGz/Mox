/**
 * useEntitlementFromDB Hook
 * 
 * Fetches entitlement status from Supabase database.
 * This is the server-synced source of truth for premium status.
 * Updated by RevenueCat webhooks.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { subscriptionKeys } from '../keys';
import type { Entitlement, EntitlementStatus } from '../types';

interface UseEntitlementFromDBReturn {
    /** Entitlement record from database */
    entitlement: Entitlement | null;
    /** Whether user has active entitlement */
    hasActiveEntitlement: boolean;
    /** Entitlement status */
    status: EntitlementStatus | null;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Refetch entitlement */
    refetch: () => Promise<void>;
}

/**
 * Hook to get entitlement from database
 * This is updated by RevenueCat webhooks and is the source of truth
 * 
 * @param userId - User ID to fetch entitlement for
 * 
 * @example
 * ```tsx
 * const { hasActiveEntitlement, status } = useEntitlementFromDB(userId);
 * 
 * if (hasActiveEntitlement) {
 *   // Show premium features
 * }
 * ```
 */
export function useEntitlementFromDB(userId: string | null): UseEntitlementFromDBReturn {
    const {
        data,
        isLoading,
        error,
        refetch: queryRefetch,
    } = useQuery({
        queryKey: subscriptionKeys.entitlement(userId ?? ''),
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('entitlements')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned - user has no entitlement
                    return null;
                }
                throw error;
            }

            return data as Entitlement;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
        gcTime: 1000 * 60 * 15, // Keep in cache for 15 minutes
    });

    const hasActiveEntitlement =
        data?.status === 'active' || data?.status === 'trial';

    const refetch = async () => {
        await queryRefetch();
    };

    return {
        entitlement: data ?? null,
        hasActiveEntitlement,
        status: data?.status ?? null,
        isLoading,
        error: error?.message ?? null,
        refetch,
    };
}
