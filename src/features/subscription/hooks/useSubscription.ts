/**
 * useSubscription Hook
 * 
 * Main hook for subscription management. Provides:
 * - Current subscription status
 * - Pro access check
 * - Actions for paywall, customer center, restore
 * 
 * Uses RevenueCat SDK via @/lib/entitlements adapter
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entitlements } from '@/lib/entitlements';
import { ENTITLEMENT_IDS } from '@/lib/config';
import { subscriptionKeys } from '../keys';
import type { SubscriptionState, SubscriptionActions, EntitlementStatus } from '../types';

interface UseSubscriptionReturn extends SubscriptionState, SubscriptionActions { }

/**
 * Hook for subscription management
 * 
 * @example
 * ```tsx
 * const { hasProAccess, presentPaywall, presentCustomerCenter } = useSubscription();
 * 
 * if (!hasProAccess) {
 *   await presentPaywall();
 * }
 * ```
 */
export function useSubscription(): UseSubscriptionReturn {
    const queryClient = useQueryClient();

    // Query for customer info from RevenueCat
    const {
        data: customerInfo,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: subscriptionKeys.customerInfo(),
        queryFn: async () => {
            const info = await entitlements.getCustomerInfo();
            return info;
        },
        staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    });

    // Listen for customer info updates
    useEffect(() => {
        const unsubscribe = entitlements.addCustomerInfoUpdateListener((newInfo) => {
            // Update cache when customer info changes
            queryClient.setQueryData(subscriptionKeys.customerInfo(), newInfo);
        });

        return unsubscribe;
    }, [queryClient]);

    // Derive subscription state from customer info
    const subscriptionState = useMemo((): SubscriptionState => {
        if (!customerInfo) {
            return {
                hasProAccess: false,
                status: null,
                planId: null,
                expiresAt: null,
                isLoading,
                error: error?.message ?? null,
            };
        }

        const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_IDS.PRO];
        const hasProAccess = proEntitlement !== undefined && proEntitlement.isActive;

        let status: EntitlementStatus | null = null;
        if (proEntitlement) {
            if (proEntitlement.isActive) {
                status = proEntitlement.periodType === 'TRIAL' ? 'trial' : 'active';
            } else if (proEntitlement.willRenew === false) {
                status = 'canceled';
            } else {
                status = 'expired';
            }
        }

        return {
            hasProAccess,
            status,
            planId: proEntitlement?.productIdentifier as any ?? null,
            expiresAt: proEntitlement?.expirationDate
                ? new Date(proEntitlement.expirationDate)
                : null,
            isLoading: false,
            error: null,
        };
    }, [customerInfo, isLoading, error]);

    // Actions
    const presentPaywall = useCallback(async (): Promise<boolean> => {
        const result = await entitlements.presentPaywall();
        if (result) {
            await refetch();
        }
        return result;
    }, [refetch]);

    const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
        const result = await entitlements.presentPaywallIfNeeded(ENTITLEMENT_IDS.PRO);
        if (result) {
            await refetch();
        }
        return result;
    }, [refetch]);

    const presentCustomerCenter = useCallback(async (): Promise<void> => {
        await entitlements.presentCustomerCenter();
    }, []);

    const restorePurchases = useCallback(async (): Promise<boolean> => {
        try {
            const info = await entitlements.restorePurchases();
            if (info) {
                queryClient.setQueryData(subscriptionKeys.customerInfo(), info);
                const proEntitlement = info.entitlements.active[ENTITLEMENT_IDS.PRO];
                return proEntitlement !== undefined && proEntitlement.isActive;
            }
            return false;
        } catch {
            return false;
        }
    }, [queryClient]);

    const refresh = useCallback(async (): Promise<void> => {
        await refetch();
    }, [refetch]);

    return {
        ...subscriptionState,
        presentPaywall,
        presentPaywallIfNeeded,
        presentCustomerCenter,
        restorePurchases,
        refresh,
    };
}
