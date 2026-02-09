export interface Notifications {
    registerForPushNotifications: () => Promise<string | null>;
    scheduleNotification: (title: string, body: string, trigger: any) => Promise<void>;
}

export const adapter: Notifications = {
    registerForPushNotifications: async () => null,
    scheduleNotification: async () => { },
};
