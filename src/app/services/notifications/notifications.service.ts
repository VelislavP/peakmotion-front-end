import { Injectable } from '@angular/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private platform: Platform) {
    this.initializeNotifications();
  }

  // Initialize notification listeners
  private async initializeNotifications() {
    // Ensure this only runs on mobile platforms (not web)
    if (this.platform.is('ios') || this.platform.is('android')) {
      await this.requestPermissions();

      // Listen for when a notification is received
      LocalNotifications.addListener('localNotificationReceived', (notification: LocalNotificationSchema) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      });

      // Listen for when a notification is tapped
      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        console.log('Notification tapped:', action.notification);
        this.handleNotificationTapped(action.notification);
      });
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display === 'granted') {
      console.log('Notification permissions granted');
      return true;
    } else {
      console.warn('Notification permissions denied');
      return false;
    }
  }

  // Schedule a single notification
  async scheduleNotification(title: string, body: string, delaySeconds: number, id: number = Date.now()) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id, // Unique ID (defaults to timestamp if not provided)
            schedule: { at: new Date(Date.now() + delaySeconds * 1000) }, // Delay in seconds
            sound: 'default', // Use default sound
            extra: { customData: 'Some extra data' }, // Optional payload
          },
        ],
      });
      console.log(`Notification scheduled with ID: ${id}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Schedule a repeating notification (e.g., daily at a specific time)
  async scheduleRepeatingNotification(title: string, body: string, hour: number, minute: number, id: number = Date.now()) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: {
              on: { hour, minute }, // Trigger at specified time
              every: 'day', // Repeat daily
            },
            sound: 'default',
          },
        ],
      });
      console.log(`Repeating notification scheduled with ID: ${id}`);
    } catch (error) {
      console.error('Error scheduling repeating notification:', error);
    }
  }

  // Cancel a notification by ID
  async cancelNotification(id: number) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      console.log(`Notification with ID: ${id} canceled`);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Handle received notification (e.g., log or update app state)
  private handleNotificationReceived(notification: LocalNotificationSchema) {
    // Add logic here, e.g., update UI or log to a service
    console.log('Handling received notification:', notification.title, notification.body);
  }

  // Handle tapped notification (e.g., navigate or perform an action)
  private handleNotificationTapped(notification: LocalNotificationSchema) {
    // Add logic here, e.g., navigate to a specific page
    console.log('Handling tapped notification:', notification.title, notification.body);
  }
}