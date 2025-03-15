import { Component } from '@angular/core';
import { BackgroundRunner } from '@capacitor/background-runner'
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  constructor() {
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
}

async function scheduleNotifications() {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1,
        title: 'Repeating Notification',
        body: 'This notification repeats every 5 seconds!',
        schedule: {
          repeats: true,
          every: 'minute', // Use 'minute' for iOS
          interval: 1,     // Works on Android, but not on iOS
        },
      },
    ],
  });
  console.log('Notification scheduled');
}
