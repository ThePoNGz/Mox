import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for Edge Functions
 * Uses service role key for admin operations (like logging to ai_logs)
 */
export function createServiceClient(): SupabaseClient {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Creates a Supabase client with user's auth context
 * Used for operations that should respect RLS
 */
export function createUserClient(authHeader: string): SupabaseClient {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: authHeader },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Verifies the Supabase Auth token and returns the user
 * Throws an error if the token is invalid
 */
export async function verifyAuthToken(authHeader: string | null): Promise<{ userId: string }> {
    if (!authHeader) {
        throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw new Error("Invalid or expired auth token");
    }

    return { userId: user.id };
}

/**
 * Find a user by their RevenueCat app_user_id
 * Since we use Supabase auth.user.id as the app_user_id, this just validates the UUID exists
 */
export async function findUserByRevenueCatId(appUserId: string): Promise<string | null> {
    if (!appUserId) return null;

    const supabase = createServiceClient();

    // Check if this is a valid user in our auth system
    const { data, error } = await supabase.auth.admin.getUserById(appUserId);

    if (error || !data.user) {
        return null;
    }

    return data.user.id;
}

/**
 * Upsert entitlement record for a user
 */
export async function upsertEntitlement(
    userId: string,
    status: string,
    planId: string | null,
    expiresAt: Date | null
): Promise<{ success: boolean; error?: string }> {
    const supabase = createServiceClient();

    const { error } = await supabase
        .from("entitlements")
        .upsert({
            user_id: userId,
            status: status,
            plan_id: planId,
            renews_at: expiresAt?.toISOString() ?? null,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: "user_id",
        });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
