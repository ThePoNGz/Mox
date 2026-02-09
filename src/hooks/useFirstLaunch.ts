import { useState, useEffect } from 'react';
import { adapter as storage } from '@/lib/storage/storage'; // Platform-agnostic import

const KEY_HAS_LAUNCHED = 'mox.has_launched';

export function useFirstLaunch() {
    const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkLikelyAsyncForWeb() {
            try {
                const hasLaunched = storage.getItem(KEY_HAS_LAUNCHED);
                setIsFirstLaunch(hasLaunched !== 'true');
            } catch (e) {
                setIsFirstLaunch(true); // Default to true on error
            } finally {
                setIsLoading(false);
            }
        }
        checkLikelyAsyncForWeb();
    }, []);

    const setLaunched = () => {
        storage.setItem(KEY_HAS_LAUNCHED, 'true');
        setIsFirstLaunch(false);
    };

    return { isFirstLaunch, isLoading, setLaunched };
}
