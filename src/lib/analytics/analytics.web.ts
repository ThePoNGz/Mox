import { Analytics } from './analytics';

export const adapter: Analytics = {
    identify: (userId, traits) => console.log('[Analytics Web] Identify:', userId, traits),
    track: (event, properties) => console.log('[Analytics Web] Track:', event, properties),
    reset: () => console.log('[Analytics Web] Reset'),
};
