import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

/**
 * Entitlements adapter interface
 * Abstracts platform-specific purchase handling (RevenueCat on native, Stripe on web)
 */
export interface Entitlements {
    /**
     * Configure RevenueCat SDK with user ID
     * @param userId - Supabase auth user ID (UUID)
     */
    configure: (userId: string) => Promise<void>;

    /**
     * Log in a user to RevenueCat (switch user context)
     * @param userId - Supabase auth user ID (UUID)
     */
    login: (userId: string) => Promise<CustomerInfo | null>;

    /**
     * Log out current user from RevenueCat
     */
    logout: () => Promise<void>;

    /**
     * Get current customer info including entitlements
     */
    getCustomerInfo: () => Promise<CustomerInfo | null>;

    /**
     * Check if user has active "Mox Pro" entitlement
     */
    hasProAccess: () => Promise<boolean>;

    /**
     * Get available offerings (products configured in RevenueCat)
     */
    getOfferings: () => Promise<PurchasesOffering | null>;

    /**
     * Purchase a package
     * @param packageToPurchase - The package to purchase
     */
    purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<CustomerInfo | null>;

    /**
     * Restore previous purchases
     */
    restorePurchases: () => Promise<CustomerInfo | null>;

    /**
     * Present the RevenueCat paywall UI
     * @param requiredEntitlementId - Optional entitlement ID to check before presenting
     * @returns true if purchase was made, false otherwise
     */
    presentPaywall: (requiredEntitlementId?: string) => Promise<boolean>;

    /**
     * Present paywall only if user doesn't have required entitlement
     * @param requiredEntitlementId - The entitlement to check for
     * @returns true if purchase was made, false otherwise
     */
    presentPaywallIfNeeded: (requiredEntitlementId: string) => Promise<boolean>;

    /**
     * Present the Customer Center for subscription management
     */
    presentCustomerCenter: () => Promise<void>;

    /**
     * Add a listener for customer info updates
     * @param listener - Callback function when customer info changes
     * @returns Cleanup function to remove listener
     */
    addCustomerInfoUpdateListener: (
        listener: (customerInfo: CustomerInfo) => void
    ) => () => void;
}

/**
 * Stub implementation for non-native environments
 */
export const adapter: Entitlements = {
    configure: async () => { },
    login: async () => null,
    logout: async () => { },
    getCustomerInfo: async () => null,
    hasProAccess: async () => false,
    getOfferings: async () => null,
    purchasePackage: async () => null,
    restorePurchases: async () => null,
    presentPaywall: async () => false,
    presentPaywallIfNeeded: async () => false,
    presentCustomerCenter: async () => { },
    addCustomerInfoUpdateListener: () => () => { },
};
