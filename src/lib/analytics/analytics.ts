export interface Analytics {
    identify: (userId: string, traits?: Record<string, any>) => void;
    track: (event: string, properties?: Record<string, any>) => void;
    reset: () => void;
}

export const adapter: Analytics = {
    identify: () => { },
    track: () => { },
    reset: () => { },
};
