import { Sentry } from './sentry';

export const adapter: Sentry = {
    init: () => console.log('[Sentry Native] Init'),
    captureException: (error) => console.log('[Sentry Native] Error:', error),
};
