import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(private platform: Platform) {
    this.requestPermission();
  }

  /**
   * Request notification permission from the user.
   */
  private async requestPermission() {
    if (this.platform.is('capacitor')) {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.warn('Local notifications permission denied');
      }
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification() {
    try {
      let scheduleDate = new Date();
      scheduleDate.setSeconds(scheduleDate.getSeconds() + 5); // Schedule after 5 seconds

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 42,
            title: 'Background Notification',
            body: 'This image comes from a background runner',
            schedule: { at: scheduleDate },
            smallIcon: 'ic_stat_icon',
            largeIcon: 'ic_launcher',
          },
        ],
      });

      console.log('Notification scheduled successfully');
    } catch (error) {
      console.error('Notification scheduling failed:', error);
    }
  }
}
