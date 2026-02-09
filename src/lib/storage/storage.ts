export interface Storage {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
}

// Default export stub for TS resolution if platform extensions aren't picked up
export const adapter: Storage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
};
