import { MMKV } from 'react-native-mmkv';
import { Storage } from './storage';

const storage = new MMKV();

export const adapter: Storage = {
    getItem: (key: string) => {
        const value = storage.getString(key);
        return value ?? null;
    },
    setItem: (key: string, value: string) => {
        storage.set(key, value);
    },
    removeItem: (key: string) => {
        storage.delete(key);
    },
};
