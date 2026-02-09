import { Sentry } from './sentry';

export const adapter: Sentry = {
    init: () => console.log('[Sentry Web] Init'),
    captureException: (error) => console.log('[Sentry Web] Error:', error),
};
