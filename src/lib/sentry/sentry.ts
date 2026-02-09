export interface Sentry {
    init: () => void;
    captureException: (error: any) => void;
}

export const adapter: Sentry = {
    init: () => { },
    captureException: () => { },
};
