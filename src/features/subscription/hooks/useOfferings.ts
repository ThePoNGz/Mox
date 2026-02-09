/**
 * useOfferings Hook
 * 
 * Fetches available subscription offerings/packages from RevenueCat.
 * Used for building custom paywall UIs.
 */

import { useQuery } from '@tanstack/react-query';
import { entitlements } from '@/lib/entitlements';
import { subscriptionKeys } from '../keys';
import { formatPackageForDisplay } from '../utils';
import type { OfferingDisplayInfo, PackageDisplayInfo } from '../types';

interface UseOfferingsReturn {
    /** Current offering with formatted packages */
    offering: OfferingDisplayInfo | null;
    /** All available packages */
    packages: PackageDisplayInfo[];
    /** Monthly package if available */
    monthly: PackageDisplayInfo | null;
    /** Yearly package if available */
    yearly: PackageDisplayInfo | null;
    /** Weekly package if available */
    weekly: PackageDisplayInfo | null;
    /** Lifetime package if available */
    lifetime: PackageDisplayInfo | null;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Refetch offerings */
    refetch: () => Promise<void>;
}

/**
 * Hook to get available subscription offerings
 * 
 * @example
 * ```tsx
 * const { packages, monthly, yearly, isLoading } = useOfferings();
 * 
 * if (isLoading) return <Loading />;
 * 
 * return (
 *   <View>
 *     {packages.map(pkg => (
 *       <PackageCard key={pkg.identifier} package={pkg} />
 *     ))}
 *   </View>
 * );
 * ```
 */
export function useOfferings(): UseOfferingsReturn {
    const {
        data,
        isLoading,
        error,
        refetch: queryRefetch,
    } = useQuery({
        queryKey: subscriptionKeys.offerings(),
        queryFn: async () => {
            const offering = await entitlements.getOfferings();
            return offering;
        },
        staleTime: 1000 * 60 * 10, // Consider fresh for 10 minutes
        gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    });

    // Format packages for display
    const packages: PackageDisplayInfo[] = data?.availablePackages?.map(formatPackageForDisplay) ?? [];

    // Find specific packages
    const findPackage = (types: string[]): PackageDisplayInfo | null => {
        return packages.find((pkg) =>
            types.some(
                (t) =>
                    pkg.identifier.toLowerCase().includes(t) ||
                    pkg.package.packageType === t.toUpperCase()
            )
        ) ?? null;
    };

    const offering: OfferingDisplayInfo | null = data
        ? {
            identifier: data.identifier,
            packages,
        }
        : null;

    const refetch = async () => {
        await queryRefetch();
    };

    return {
        offering,
        packages,
        monthly: findPackage(['monthly', 'MONTHLY']),
        yearly: findPackage(['annual', 'yearly', 'ANNUAL']),
        weekly: findPackage(['weekly', 'WEEKLY']),
        lifetime: findPackage(['lifetime', 'LIFETIME']),
        isLoading,
        error: error?.message ?? null,
        refetch,
    };
}
