export const config = {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    revenueCatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY!,
};

// RevenueCat Entitlement Identifiers
export const ENTITLEMENT_IDS = {
    PRO: 'Mox Pro',
} as const;

// RevenueCat Product Identifiers
export const PRODUCT_IDS = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    LIFETIME: 'lifetime',
    WEEKLY: 'weekly',
} as const;

if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.error(
        'Missing Supabase configuration. Please check your .env file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
}

if (!config.revenueCatApiKey) {
    console.error(
        'Missing RevenueCat configuration. Please check your .env file and ensure EXPO_PUBLIC_REVENUECAT_API_KEY is set.'
    );
}
