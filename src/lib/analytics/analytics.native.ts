import { Analytics } from './analytics';

export const adapter: Analytics = {
    identify: (userId, traits) => console.log('[Analytics Native] Identify:', userId, traits),
    track: (event, properties) => console.log('[Analytics Native] Track:', event, properties),
    reset: () => console.log('[Analytics Native] Reset'),
};
