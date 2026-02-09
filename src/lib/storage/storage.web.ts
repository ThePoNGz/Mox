import { Storage } from './storage';

export const adapter: Storage = {
    getItem: (key: string) => {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    removeItem: (key: string) => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
        }
    },
};
