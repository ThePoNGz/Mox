/**
 * Shared configuration for Edge Functions
 */

export const config = {
    corsHeaders: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-revenuecat-webhook',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
};
