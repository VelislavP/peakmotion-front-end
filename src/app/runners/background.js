addEventListener('myCustomEvent', (resolve, reject, args) => {
    console.log('do something to update the system here');
    resolve();
  });
  
  addEventListener('myCustomEventWithReturnData', (resolve, reject, args) => {
    try {
      console.log('accepted this data: ' + JSON.stringify(args.user));
  
      const updatedUser = args.user;
      updatedUser.firstName = updatedUser.firstName + ' HELLO';
      updatedUser.lastName = updatedUser.lastName + ' WORLD';
  
      resolve(updatedUser);
    } catch (err) {
      reject(err);
    }
  });
  
  addEventListener('remoteNotification', (resolve, reject, args) => {
    try {
      console.log('received silent push notification');
  
      CapacitorNotifications.schedule([
        {
          id: 100,
          title: 'Enterprise Background Runner',
          body: 'Received silent push notification',
        },
      ]);
  
      resolve();
    } catch (err) {
      reject();
    }
  });  