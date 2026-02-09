import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useInitializeRevenueCat } from '@/features/subscription/hooks';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 2, // 2 minutes
            retry: 2,
        },
    },
});

/**
 * RevenueCat Initializer Component
 * Initializes RevenueCat SDK when user is authenticated
 */
function RevenueCatInitializer() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserId(session?.user?.id ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Initialize RevenueCat with user ID
    useInitializeRevenueCat(userId);

    return null;
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                <RevenueCatInitializer />
                <Stack screenOptions={{ headerShown: false }} />
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}
