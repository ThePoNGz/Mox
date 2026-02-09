/**
 * Subscription Feature Utilities
 */

import type { PurchasesPackage } from 'react-native-purchases';
import type { PackageDisplayInfo, SubscriptionPlan } from './types';

/**
 * Map package identifier to subscription plan type
 */
export function mapPackageToplan(packageIdentifier: string): SubscriptionPlan | null {
    const mapping: Record<string, SubscriptionPlan> = {
        '$rc_monthly': 'monthly',
        '$rc_annual': 'yearly',
        '$rc_weekly': 'weekly',
        '$rc_lifetime': 'lifetime',
        'monthly': 'monthly',
        'yearly': 'yearly',
        'weekly': 'weekly',
        'lifetime': 'lifetime',
    };

    return mapping[packageIdentifier] ?? null;
}

/**
 * Format package for display in custom UI
 */
export function formatPackageForDisplay(pkg: PurchasesPackage): PackageDisplayInfo {
    const product = pkg.product;

    // Calculate per-month price for annual packages
    let pricePerMonth: string | undefined;
    let savings: string | undefined;

    if (pkg.packageType === 'ANNUAL' && product.price) {
        const monthlyPrice = product.price / 12;
        pricePerMonth = `${product.currencyCode} ${monthlyPrice.toFixed(2)}/mo`;
        // Assume ~40% savings on annual
        savings = 'Save ~40%';
    }

    return {
        identifier: pkg.identifier,
        title: product.title || getPackageTitle(pkg.packageType),
        description: product.description || getPackageDescription(pkg.packageType),
        price: product.priceString,
        pricePerMonth,
        savings,
        package: pkg,
    };
}

/**
 * Get human-readable title for package type
 */
function getPackageTitle(packageType: string): string {
    const titles: Record<string, string> = {
        'MONTHLY': 'Monthly',
        'ANNUAL': 'Yearly',
        'WEEKLY': 'Weekly',
        'LIFETIME': 'Lifetime',
        'SIX_MONTH': '6 Months',
        'THREE_MONTH': '3 Months',
        'TWO_MONTH': '2 Months',
    };
    return titles[packageType] || packageType;
}

/**
 * Get description for package type
 */
function getPackageDescription(packageType: string): string {
    const descriptions: Record<string, string> = {
        'MONTHLY': 'Billed monthly, cancel anytime',
        'ANNUAL': 'Billed annually, best value',
        'WEEKLY': 'Billed weekly',
        'LIFETIME': 'One-time purchase, forever access',
    };
    return descriptions[packageType] || 'Subscription';
}

/**
 * Check if a date is in the future (not expired)
 */
export function isNotExpired(expiresAt: string | Date | null): boolean {
    if (!expiresAt) return false;
    const expDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    return expDate > new Date();
}

/**
 * Format expiration date for display
 */
export function formatExpirationDate(expiresAt: string | Date | null): string {
    if (!expiresAt) return 'Never expires';

    const expDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;

    // Check for lifetime (far future)
    if (expDate.getFullYear() >= 2099) {
        return 'Lifetime access';
    }

    return expDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Get status display text
 */
export function getStatusDisplayText(
    status: 'active' | 'trial' | 'canceled' | 'expired' | null
): string {
    switch (status) {
        case 'active':
            return 'Active';
        case 'trial':
            return 'Trial';
        case 'canceled':
            return 'Cancelled';
        case 'expired':
            return 'Expired';
        default:
            return 'Free';
    }
}
