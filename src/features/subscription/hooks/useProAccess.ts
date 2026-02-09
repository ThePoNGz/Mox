/**
 * useProAccess Hook
 * 
 * Simple hook to check if user has Mox Pro access.
 * Combines RevenueCat and database checks for robust verification.
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entitlements } from '@/lib/entitlements';
import { ENTITLEMENT_IDS } from '@/lib/config';
import { subscriptionKeys } from '../keys';

interface UseProAccessReturn {
    /** Whether user has pro access */
    hasProAccess: boolean;
    /** Loading state */
    isLoading: boolean;
    /** Check and potentially present paywall if no access */
    requireProAccess: () => Promise<boolean>;
    /** Present paywall regardless of current access */
    showPaywall: () => Promise<boolean>;
}

/**
 * Simple hook for pro access check
 * 
 * @example
 * ```tsx
 * const { hasProAccess, requireProAccess } = useProAccess();
 * 
 * const handlePremiumFeature = async () => {
 *   const hasAccess = await requireProAccess();
 *   if (hasAccess) {
 *     // Do premium feature
 *   }
 * };
 * ```
 */
export function useProAccess(): UseProAccessReturn {
    const queryClient = useQueryClient();

    const { data: hasProAccess = false, isLoading } = useQuery({
        queryKey: subscriptionKeys.proAccess(),
        queryFn: async () => {
            return await entitlements.hasProAccess();
        },
        staleTime: 1000 * 60 * 2, // Consider fresh for 2 minutes
    });

    const requireProAccess = useCallback(async (): Promise<boolean> => {
        // First check current status
        const currentAccess = await entitlements.hasProAccess();

        if (currentAccess) {
            return true;
        }

        // Present paywall and check result
        const purchased = await entitlements.presentPaywallIfNeeded(ENTITLEMENT_IDS.PRO);

        // Invalidate cache to refresh status
        await queryClient.invalidateQueries({
            queryKey: subscriptionKeys.all,
        });

        return purchased;
    }, [queryClient]);

    const showPaywall = useCallback(async (): Promise<boolean> => {
        const purchased = await entitlements.presentPaywall();

        // Invalidate cache to refresh status
        await queryClient.invalidateQueries({
            queryKey: subscriptionKeys.all,
        });

        return purchased;
    }, [queryClient]);

    return {
        hasProAccess,
        isLoading,
        requireProAccess,
        showPaywall,
    };
}
