import { Notifications } from './notifications';

export const adapter: Notifications = {
    registerForPushNotifications: async () => {
        console.log('[Notifications Web] Register');
        return null;
    },
    scheduleNotification: async (title, body, trigger) => {
        console.log('[Notifications Web] Schedule:', title);
    },
};
