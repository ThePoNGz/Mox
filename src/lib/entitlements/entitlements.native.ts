import Purchases, {
    CustomerInfo,
    LOG_LEVEL,
    PurchasesOffering,
    PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { config, ENTITLEMENT_IDS } from '@/lib/config';
import type { Entitlements } from './entitlements';

let isConfigured = false;

/**
 * Native RevenueCat implementation for iOS/Android
 */
export const adapter: Entitlements = {
    /**
     * Configure RevenueCat SDK with API key and optional user ID
     * Should be called once during app initialization
     */
    configure: async (userId: string) => {
        if (isConfigured) {
            console.log('[RevenueCat] Already configured, logging in user:', userId);
            await adapter.login(userId);
            return;
        }

        try {
            // Enable debug logging in development
            if (__DEV__) {
                Purchases.setLogLevel(LOG_LEVEL.DEBUG);
            }

            // Configure with API key and app user ID
            await Purchases.configure({
                apiKey: config.revenueCatApiKey,
                appUserID: userId, // Must be Supabase auth.user.id (UUID)
            });

            isConfigured = true;
            console.log('[RevenueCat] Configured successfully for user:', userId);
        } catch (error) {
            console.error('[RevenueCat] Configuration failed:', error);
            throw error;
        }
    },

    /**
     * Log in user - associates purchases with this user ID
     */
    login: async (userId: string) => {
        try {
            const { customerInfo } = await Purchases.logIn(userId);
            console.log('[RevenueCat] User logged in:', userId);
            return customerInfo;
        } catch (error) {
            console.error('[RevenueCat] Login failed:', error);
            return null;
        }
    },

    /**
     * Log out current user - creates anonymous user
     */
    logout: async () => {
        try {
            await Purchases.logOut();
            console.log('[RevenueCat] User logged out');
        } catch (error) {
            console.error('[RevenueCat] Logout failed:', error);
        }
    },

    /**
     * Get current customer info including subscription status
     */
    getCustomerInfo: async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            return customerInfo;
        } catch (error) {
            console.error('[RevenueCat] Failed to get customer info:', error);
            return null;
        }
    },

    /**
     * Check if user has active Mox Pro entitlement
     */
    hasProAccess: async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_IDS.PRO];
            return proEntitlement !== undefined && proEntitlement.isActive;
        } catch (error) {
            console.error('[RevenueCat] Failed to check pro access:', error);
            return false;
        }
    },

    /**
     * Get available offerings configured in RevenueCat dashboard
     */
    getOfferings: async () => {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null) {
                console.log('[RevenueCat] Current offering:', offerings.current.identifier);
                return offerings.current;
            }
            console.log('[RevenueCat] No current offering available');
            return null;
        } catch (error) {
            console.error('[RevenueCat] Failed to get offerings:', error);
            return null;
        }
    },

    /**
     * Purchase a specific package
     */
    purchasePackage: async (packageToPurchase: PurchasesPackage) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
            console.log('[RevenueCat] Purchase successful:', packageToPurchase.identifier);
            return customerInfo;
        } catch (error: any) {
            // Check if user cancelled
            if (error.userCancelled) {
                console.log('[RevenueCat] Purchase cancelled by user');
                return null;
            }
            console.error('[RevenueCat] Purchase failed:', error);
            throw error;
        }
    },

    /**
     * Restore previous purchases
     */
    restorePurchases: async () => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            console.log('[RevenueCat] Purchases restored');
            return customerInfo;
        } catch (error) {
            console.error('[RevenueCat] Restore failed:', error);
            throw error;
        }
    },

    /**
     * Present RevenueCat Paywall UI
     */
    presentPaywall: async (requiredEntitlementId?: string) => {
        try {
            let result: PAYWALL_RESULT;

            if (requiredEntitlementId) {
                result = await RevenueCatUI.presentPaywallIfNeeded({
                    requiredEntitlementIdentifier: requiredEntitlementId,
                });
            } else {
                result = await RevenueCatUI.presentPaywall();
            }

            switch (result) {
                case PAYWALL_RESULT.PURCHASED:
                case PAYWALL_RESULT.RESTORED:
                    console.log('[RevenueCat] Paywall result: purchased/restored');
                    return true;
                case PAYWALL_RESULT.NOT_PRESENTED:
                    console.log('[RevenueCat] Paywall not presented (user already has access)');
                    return false;
                case PAYWALL_RESULT.CANCELLED:
                    console.log('[RevenueCat] Paywall cancelled by user');
                    return false;
                case PAYWALL_RESULT.ERROR:
                    console.log('[RevenueCat] Paywall error');
                    return false;
                default:
                    return false;
            }
        } catch (error) {
            console.error('[RevenueCat] Failed to present paywall:', error);
            return false;
        }
    },

    /**
     * Present paywall only if user doesn't have the required entitlement
     */
    presentPaywallIfNeeded: async (requiredEntitlementId: string) => {
        try {
            const result = await RevenueCatUI.presentPaywallIfNeeded({
                requiredEntitlementIdentifier: requiredEntitlementId,
            });

            switch (result) {
                case PAYWALL_RESULT.PURCHASED:
                case PAYWALL_RESULT.RESTORED:
                    return true;
                default:
                    return false;
            }
        } catch (error) {
            console.error('[RevenueCat] Failed to present paywall if needed:', error);
            return false;
        }
    },

    /**
     * Present Customer Center for subscription management
     */
    presentCustomerCenter: async () => {
        try {
            await RevenueCatUI.presentCustomerCenter({
                callbacks: {
                    onFeedbackSurveyCompleted: (params) => {
                        console.log('[RevenueCat] Feedback survey completed:', params.feedbackSurveyOptionId);
                    },
                    onShowingManageSubscriptions: () => {
                        console.log('[RevenueCat] Showing manage subscriptions');
                    },
                    onRestoreStarted: () => {
                        console.log('[RevenueCat] Restore started from Customer Center');
                    },
                    onRestoreCompleted: (params) => {
                        console.log('[RevenueCat] Restore completed from Customer Center');
                    },
                    onRestoreFailed: (params) => {
                        console.error('[RevenueCat] Restore failed from Customer Center:', params.error);
                    },
                },
            });
        } catch (error) {
            console.error('[RevenueCat] Failed to present Customer Center:', error);
        }
    },

    /**
     * Add listener for customer info changes (subscription updates, etc.)
     */
    addCustomerInfoUpdateListener: (listener: (customerInfo: CustomerInfo) => void) => {
        Purchases.addCustomerInfoUpdateListener(listener);
        return () => {
            Purchases.removeCustomerInfoUpdateListener(listener);
        };
    },
};
