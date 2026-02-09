/**
 * Subscription Feature Types
 * Types for subscription/entitlement management
 */

import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

/**
 * Entitlement status from database
 */
export type EntitlementStatus = 'active' | 'trial' | 'canceled' | 'expired';

/**
 * Entitlement record from database
 */
export interface Entitlement {
    user_id: string;
    status: EntitlementStatus;
    plan_id: string | null;
    expires_at: string | null;
    updated_at: string;
}

/**
 * Subscription plan types
 */
export type SubscriptionPlan = 'monthly' | 'yearly' | 'lifetime' | 'weekly';

/**
 * Subscription state for UI
 */
export interface SubscriptionState {
    /** Whether user has active pro access */
    hasProAccess: boolean;
    /** Current entitlement status */
    status: EntitlementStatus | null;
    /** Current plan ID */
    planId: SubscriptionPlan | null;
    /** Expiration date (null for lifetime) */
    expiresAt: Date | null;
    /** Whether data is loading */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
}

/**
 * Package display info for custom paywall UI
 */
export interface PackageDisplayInfo {
    identifier: string;
    title: string;
    description: string;
    price: string;
    pricePerMonth?: string;
    savings?: string;
    package: PurchasesPackage;
}

/**
 * Offering with display info
 */
export interface OfferingDisplayInfo {
    identifier: string;
    packages: PackageDisplayInfo[];
}

/**
 * Result of a purchase attempt
 */
export interface PurchaseResult {
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
    userCancelled?: boolean;
}

/**
 * Subscription actions available to the user
 */
export interface SubscriptionActions {
    /** Present the paywall */
    presentPaywall: () => Promise<boolean>;
    /** Present paywall only if needed */
    presentPaywallIfNeeded: () => Promise<boolean>;
    /** Present customer center */
    presentCustomerCenter: () => Promise<void>;
    /** Restore purchases */
    restorePurchases: () => Promise<boolean>;
    /** Refresh subscription status */
    refresh: () => Promise<void>;
}
