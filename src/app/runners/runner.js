const { LocalNotifications } = require('@capacitor/local-notifications');

addEventListener('notificationTest', async (resolve, reject, args) => {
  console.log('NotificationTest event triggered');

//   try {
    // // Check if notification permissions are granted
    // let permissionStatus = await LocalNotifications.checkPermissions();
    // if (permissionStatus.display !== 'granted') {
    //   // Request permissions if not granted
    //   permissionStatus = await LocalNotifications.requestPermissions();
    //   if (permissionStatus.display !== 'granted') {
    //     console.error('Notification permissions not granted');
    //     reject(new Error('Notification permissions not granted'));
    //     return;
    //   }
    // }

    console.log('Notification 1');

    // Schedule the notification
//     await LocalNotifications.schedule({
//       notifications: [
//         {
//           title: 'Test Notification',
//           body: 'This is a test notification from BackgroundRunner',
//           id: 1, // Use a unique numeric ID
//           schedule: { at: new Date(Date.now() + 1 * 1000) }, // Schedule 1 second from now
//           sound: 'default', // Use the default sound
//           extra: { customData: 'Some extra data' }, // Optional payload
//         },
//       ],
//     });

//     console.log('Notification scheduled successfully');
//     resolve(); // Indicate successful completion of the task
//   } catch (error) {
//     console.error('Error scheduling notification:', error);
//     reject(error); // Indicate failure of the task
//   }
});