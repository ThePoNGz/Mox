import type { Entitlements } from './entitlements';

/**
 * Web stub implementation
 * In Phase 3, this will integrate with Stripe Checkout
 * For now, returns stubs that indicate no premium access on web
 */
export const adapter: Entitlements = {
    configure: async (userId: string) => {
        console.log('[Entitlements/Web] Configure called for user:', userId);
        console.log('[Entitlements/Web] Web subscriptions will use Stripe (Phase 3)');
    },

    login: async (userId: string) => {
        console.log('[Entitlements/Web] Login called for user:', userId);
        return null;
    },

    logout: async () => {
        console.log('[Entitlements/Web] Logout called');
    },

    getCustomerInfo: async () => {
        console.log('[Entitlements/Web] getCustomerInfo - web not supported');
        return null;
    },

    hasProAccess: async () => {
        // On web, check entitlements from database instead of RevenueCat
        console.log('[Entitlements/Web] hasProAccess - check database for web entitlements');
        return false;
    },

    getOfferings: async () => {
        console.log('[Entitlements/Web] getOfferings - web not supported');
        return null;
    },

    purchasePackage: async () => {
        console.log('[Entitlements/Web] purchasePackage - use Stripe Checkout on web');
        return null;
    },

    restorePurchases: async () => {
        console.log('[Entitlements/Web] restorePurchases - not applicable on web');
        return null;
    },

    presentPaywall: async () => {
        console.log('[Entitlements/Web] presentPaywall - redirect to Stripe Checkout (Phase 3)');
        return false;
    },

    presentPaywallIfNeeded: async () => {
        console.log('[Entitlements/Web] presentPaywallIfNeeded - redirect to Stripe Checkout (Phase 3)');
        return false;
    },

    presentCustomerCenter: async () => {
        console.log('[Entitlements/Web] presentCustomerCenter - redirect to Stripe Portal (Phase 3)');
    },

    addCustomerInfoUpdateListener: () => {
        console.log('[Entitlements/Web] addCustomerInfoUpdateListener - not applicable on web');
        return () => { };
    },
};
