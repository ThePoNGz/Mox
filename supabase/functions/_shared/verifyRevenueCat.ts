/**
 * RevenueCat Webhook Verification
 * Verifies that incoming webhooks are from RevenueCat using the authorization header
 */

const REVENUECAT_WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');

/**
 * Verify that the webhook request is from RevenueCat
 * @param authorizationHeader - The Authorization header from the request
 * @returns true if the webhook is verified, false otherwise
 */
export function verifyRevenueCatWebhook(authorizationHeader: string | null): boolean {
    if (!REVENUECAT_WEBHOOK_SECRET) {
        console.error('[RevenueCat] REVENUECAT_WEBHOOK_SECRET not configured');
        return false;
    }

    if (!authorizationHeader) {
        console.error('[RevenueCat] No authorization header provided');
        return false;
    }

    // RevenueCat sends the secret directly in the Authorization header
    // or as "Bearer <secret>" depending on configuration
    const secret = authorizationHeader.startsWith('Bearer ')
        ? authorizationHeader.slice(7)
        : authorizationHeader;

    return secret === REVENUECAT_WEBHOOK_SECRET;
}

/**
 * RevenueCat Event Types
 */
export type RevenueCatEventType =
    | 'TEST'
    | 'INITIAL_PURCHASE'
    | 'RENEWAL'
    | 'CANCELLATION'
    | 'UNCANCELLATION'
    | 'NON_RENEWING_PURCHASE'
    | 'SUBSCRIPTION_PAUSED'
    | 'EXPIRATION'
    | 'BILLING_ISSUE'
    | 'PRODUCT_CHANGE'
    | 'TRANSFER'
    | 'SUBSCRIPTION_EXTENDED'
    | 'TEMPORARY_ENTITLEMENT_GRANT'
    | 'REFUND_REVERSED'
    | 'INVOICE_ISSUANCE'
    | 'VIRTUAL_CURRENCY_TRANSACTION'
    | 'EXPERIMENT_ENROLLMENT';

/**
 * RevenueCat Webhook Event structure
 */
export interface RevenueCatWebhookEvent {
    api_version: string;
    event: {
        type: RevenueCatEventType;
        id: string;
        app_id: string;
        event_timestamp_ms: number;
        app_user_id: string;
        original_app_user_id: string;
        aliases: string[];
        product_id: string;
        entitlement_ids: string[] | null;
        store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTIONAL' | 'AMAZON';
        environment: 'SANDBOX' | 'PRODUCTION';
        purchased_at_ms?: number;
        expiration_at_ms?: number | null;
        cancel_reason?: string;
        is_family_share?: boolean;
        price?: number;
        currency?: string;
        period_type?: 'NORMAL' | 'TRIAL' | 'INTRO';
        presented_offering_id?: string;
        transaction_id?: string;
        original_transaction_id?: string;
    };
}

/**
 * Map RevenueCat event type to entitlement status
 */
export function mapEventTypeToStatus(
    eventType: RevenueCatEventType
): 'active' | 'trial' | 'canceled' | 'expired' | null {
    switch (eventType) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'UNCANCELLATION':
        case 'SUBSCRIPTION_EXTENDED':
        case 'REFUND_REVERSED':
            return 'active';
        case 'TEMPORARY_ENTITLEMENT_GRANT':
            return 'trial';
        case 'CANCELLATION':
        case 'BILLING_ISSUE':
            return 'canceled';
        case 'EXPIRATION':
            return 'expired';
        case 'NON_RENEWING_PURCHASE':
            // Non-renewing (lifetime) purchases are considered active
            return 'active';
        case 'SUBSCRIPTION_PAUSED':
            return 'canceled';
        case 'TEST':
        case 'PRODUCT_CHANGE':
        case 'TRANSFER':
        case 'INVOICE_ISSUANCE':
        case 'VIRTUAL_CURRENCY_TRANSACTION':
        case 'EXPERIMENT_ENROLLMENT':
        default:
            // These events don't directly change status
            return null;
    }
}
