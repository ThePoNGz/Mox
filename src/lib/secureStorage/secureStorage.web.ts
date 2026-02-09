import { SecureStorage } from './secureStorage';

// Web stub as per tech stack requirements. 
// Note: This means no auth persistence on web unless strict rules are modified.
export const adapter: SecureStorage = {
    getItem: async (key: string) => {
        return null;
    },
    setItem: async (key: string, value: string) => {
        // No-op
    },
    removeItem: async (key: string) => {
        // No-op
    },
};
