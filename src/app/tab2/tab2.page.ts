import { Component } from '@angular/core';
import { BackgroundRunner } from '@capacitor/background-runner'
import { LocalNotifications } from '@capacitor/local-notifications';
import { NotificationService } from '../services/notifications.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  constructor(private notificationService: NotificationService) {}

  scheduleTestNotification() {
    this.notificationService.scheduleNotification('Test Title', 'This is a test notification', 5); // 5 seconds delay
  }

  scheduleDailyNotification() {
    this.notificationService.scheduleRepeatingNotification('Daily Reminder', 'Check your app!', 8, 0); // 8:00 AM daily
  }

  cancelTestNotification() {
    this.notificationService.cancelNotification(12345); // Replace with actual ID
  }
}

