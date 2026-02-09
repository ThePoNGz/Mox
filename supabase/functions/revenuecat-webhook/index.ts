

import { config } from '../_shared/config.ts';
import {
    verifyRevenueCatWebhook,
    mapEventTypeToStatus,
    type RevenueCatWebhookEvent,
} from '../_shared/verifyRevenueCat.ts';
import { upsertEntitlement, findUserByRevenueCatId } from '../_shared/db.ts';
import { createLogger } from '../_shared/logger.ts';

const logger = createLogger('revenuecat-webhook');

/**
 * RevenueCat Webhook Handler
 * 
 * Listens for RevenueCat events:
 * - INITIAL_PURCHASE: New subscription started
 * - RENEWAL: Subscription renewed
 * - CANCELLATION: Subscription cancelled (still active until expiration)
 * - EXPIRATION: Subscription expired
 * - UNCANCELLATION: User re-enabled auto-renewal
 * - NON_RENEWING_PURCHASE: Lifetime/one-time purchase
 * - BILLING_ISSUE: Payment failed
 * - SUBSCRIPTION_EXTENDED: Subscription extended (e.g., refund reversal)
 * 
 * Updates the entitlements table with new status and expiration date.
 * 
 * Security: Uses shared secret in Authorization header.
 */
Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: config.corsHeaders,
        });
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
        logger.warn('Invalid method', { method: req.method });
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...config.corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        // Verify webhook authenticity
        const authHeader = req.headers.get('Authorization');
        if (!verifyRevenueCatWebhook(authHeader)) {
            logger.error('Webhook verification failed');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...config.corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Parse webhook body
        const body: RevenueCatWebhookEvent = await req.json();
        const event = body.event;

        logger.info('Received webhook event', {
            type: event.type,
            id: event.id,
            app_user_id: event.app_user_id,
            product_id: event.product_id,
            environment: event.environment,
        });

        // Handle TEST event
        if (event.type === 'TEST') {
            logger.info('Test webhook received successfully');
            return new Response(JSON.stringify({ received: true, test: true }), {
                status: 200,
                headers: { ...config.corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Find user in our database
        // RevenueCat app_user_id should match Supabase auth.user.id
        const userId = await findUserByRevenueCatId(event.app_user_id);

        if (!userId) {
            // Also check original_app_user_id in case of account transfers
            const originalUserId = await findUserByRevenueCatId(event.original_app_user_id);

            if (!originalUserId) {
                logger.warn('User not found', {
                    app_user_id: event.app_user_id,
                    original_app_user_id: event.original_app_user_id,
                });
                // Return 200 to prevent retries - user doesn't exist in our system
                return new Response(JSON.stringify({ received: true, user_found: false }), {
                    status: 200,
                    headers: { ...config.corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        const targetUserId = userId || event.app_user_id;

        // Determine new entitlement status based on event type
        const newStatus = mapEventTypeToStatus(event.type);

        if (newStatus === null) {
            logger.info('Event type does not change entitlement status', {
                type: event.type,
            });
            return new Response(JSON.stringify({ received: true, status_changed: false }), {
                status: 200,
                headers: { ...config.corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Calculate expiration date
        let expiresAt: Date | null = null;
        if (event.expiration_at_ms) {
            expiresAt = new Date(event.expiration_at_ms);
        } else if (event.type === 'NON_RENEWING_PURCHASE') {
            // Lifetime purchase - set far future expiration
            expiresAt = new Date('2099-12-31T23:59:59Z');
        }

        // Get plan ID from product_id or entitlement_ids
        const planId = event.product_id || (event.entitlement_ids?.[0] ?? null);

        // Update entitlements in database
        const result = await upsertEntitlement(targetUserId, newStatus, planId, expiresAt);

        if (!result.success) {
            logger.error('Failed to update entitlement', {
                user_id: targetUserId,
                error: result.error,
            });
            // Return 500 to trigger retry
            return new Response(JSON.stringify({ error: 'Database update failed' }), {
                status: 500,
                headers: { ...config.corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        logger.info('Entitlement updated successfully', {
            user_id: targetUserId,
            status: newStatus,
            plan_id: planId,
            expires_at: expiresAt?.toISOString(),
            event_type: event.type,
        });

        return new Response(
            JSON.stringify({
                received: true,
                user_id: targetUserId,
                status: newStatus,
                event_type: event.type,
            }),
            {
                status: 200,
                headers: { ...config.corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Webhook processing failed', { error: message });

        return new Response(JSON.stringify({ error: message }), {
            status: 400,
            headers: { ...config.corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
