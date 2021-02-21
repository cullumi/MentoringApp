

import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { registerPushToken } from './API.js';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

export async function registerForPushNotifications() {
    try {
        const permission = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        if (!permission.granted) return;
        const token = await Notifications.getExpoPushTokenAsync();
        console.log(token);
        registerPushToken(token);
    } catch (error) {
        console.log('Error getting a Notification token', error);
    }
}