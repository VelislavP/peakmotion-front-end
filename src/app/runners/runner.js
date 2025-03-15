import { Capacitor } from "@capacitor/core";

addEventListener('notificationTest', () => {
  try {
    let scheduleDate = new Date();
    scheduleDate.setSeconds(scheduleDate.getSeconds() + 5);

    CapacitorNotifications.schedule([
      {
        id: 42,
        title: 'Background image',
        body: 'This image comes from a background runner',
        scheduleAt: scheduleDate
      }
    ]);
    print('=================\nNotification sent')
  } catch(error) {
    reject(error);
    print('=================\nNotification rejected')
  }
});