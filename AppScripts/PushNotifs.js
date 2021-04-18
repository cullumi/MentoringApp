

import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions';
import { useEffect } from 'react';
import { updatePushToken } from './API.js';
import { cur } from './globals.js';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
});

export const useNotification = (notificationListener) => {
    useEffect(() => {
        registerForPushNotifications();

        if (notificationListener) Notifications.addPushTokenListener(notificationListener);
    }, []);
}

export async function registerForPushNotifications() {
    try {
        const permission = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        if (!permission.granted) return;
        const pushToken = await Notifications.getExpoPushTokenAsync();
        console.log(pushToken);
        cur.expoPushToken = token;
        updatePushToken();
        // if (cur.name == "null") {
        //   pushToken ;
        // }
        // else {
        // }
    } catch (error) {
        console.log('Error getting a Notification token', error);
    }
}