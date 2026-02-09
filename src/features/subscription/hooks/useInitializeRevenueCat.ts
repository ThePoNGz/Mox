/**
 * useInitializeRevenueCat Hook
 * 
 * Initializes RevenueCat SDK when user is authenticated.
 * Should be called once in the root layout.
 */

import { useEffect, useRef } from 'react';
import { entitlements } from '@/lib/entitlements';

/**
 * Initialize RevenueCat with user ID
 * 
 * @param userId - Supabase auth user ID (null if not authenticated)
 * 
 * @example
 * ```tsx
 * // In root layout
 * const { session } = useAuth();
 * useInitializeRevenueCat(session?.user?.id ?? null);
 * ```
 */
export function useInitializeRevenueCat(userId: string | null) {
    const initializedRef = useRef<string | null>(null);

    useEffect(() => {
        async function initialize() {
            if (!userId) {
                // User logged out - logout from RevenueCat
                if (initializedRef.current) {
                    console.log('[RevenueCat] User logged out, clearing session');
                    await entitlements.logout();
                    initializedRef.current = null;
                }
                return;
            }

            // Skip if already initialized for this user
            if (initializedRef.current === userId) {
                return;
            }

            try {
                console.log('[RevenueCat] Initializing for user:', userId);
                await entitlements.configure(userId);
                initializedRef.current = userId;
            } catch (error) {
                console.error('[RevenueCat] Failed to initialize:', error);
            }
        }

        initialize();
    }, [userId]);
}
