import { Notifications } from './notifications';

export const adapter: Notifications = {
    registerForPushNotifications: async () => {
        console.log('[Notifications Native] Register');
        return null;
    },
    scheduleNotification: async (title, body, trigger) => {
        console.log('[Notifications Native] Schedule:', title);
    },
};
