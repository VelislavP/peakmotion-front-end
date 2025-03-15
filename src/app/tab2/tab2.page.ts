import { Component } from '@angular/core';
import { BackgroundRunner } from '@capacitor/background-runner'
import { LocalNotifications } from '@capacitor/local-notifications';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  constructor(private notificationService: NotificationsService) {
    this.init()
  }

  async init() {
    try {
      const permissions = await BackgroundRunner.requestPermissions({
        apis: ['geolocation', 'notifications']
      });
      console.log('=================')
      console.log(permissions);
    } catch (error) {
      console.log("Not Granted permissions");
    }
  }

  async testSave() {
    const result = await BackgroundRunner.dispatchEvent({
      label: 'com.peakmotion.runner.check',
      event: 'testSave',
      details: {}
    });
  }

  async testLoad() {
    const result = await BackgroundRunner.dispatchEvent({
      label: 'com.peakmotion.runner.check',
      event: 'testLoad',
      details: {}
    });
  }

  async testSchduleNotification() {
    await BackgroundRunner.dispatchEvent({
      label: 'com.peakmotion.runner.check',
      event: 'notificationTest',
      details: {}
    });
  }

  scheduleNotifications() {
    this.notificationService.scheduleNotification();
  }
}

