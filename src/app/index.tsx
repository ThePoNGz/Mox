import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useFirstLaunch } from '@/hooks/useFirstLaunch';

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);
    const [authInitialized, setAuthInitialized] = useState(false);
    const { isFirstLaunch, isLoading: isFirstLaunchLoading } = useFirstLaunch();

    useEffect(() => {
        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setAuthInitialized(true);
        });

        // Listen for Auth Changes (Sign In, Sign Out, Anon Auth)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            // Ensure we mark initialized if auth state changes (e.g. fast sign in)
            setAuthInitialized(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Show loading spinner while checking auth or storage
    if (!authInitialized || isFirstLaunchLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Priority 1: First Launch -> Onboarding (Only if not logged in to be safe, or just always?)
    // User flow says: If installed for first time -> First screen.
    // We assume if they are logged in (e.g. from previous install kept data?), they skip onboarding.
    // But usually fresh install = no session.
    if (isFirstLaunch && !session) {
        return <Redirect href="/onboarding" />;
    }

    // Priority 2: Not authenticated -> Login/Auth Prompt
    if (!session) {
        return <Redirect href="/(auth)/login" />;
    }

    // Priority 3: Authenticated -> Main App
    return <Redirect href="/(tabs)/schedule" />;
}
