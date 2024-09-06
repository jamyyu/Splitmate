document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Attempting to register Service Worker...');
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        if (registration.active) {
          console.log('Service Worker is already active.');
          subscribeUserToPush(registration); // Service Worker 已經就緒，立即嘗試訂閱
        } else {
          // 監聽 Service Worker 狀態
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  console.log('Service Worker is activated.');
                  subscribeUserToPush(registration); // Service Worker ok後嘗試訂閱
                }
              });
            }
          });
        }
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  } else {
    console.warn('Push messaging is not supported');
  }
})

// 訂閱推播通知
function subscribeUserToPush(registration) {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(subscription => {
    console.log('User is subscribed:', subscription);
    // 將訂閱對象發送到服務器
    sendSubscriptionToServer(subscription);
  })
  .catch(error => {
    console.error('Failed to subscribe the user: ', error.message);
  });
}


// 發送訂閱信息到服務器
function sendSubscriptionToServer(subscription) {
  const groupData = JSON.parse(sessionStorage.getItem('groupData'));
  const currentGroupId = groupData.id;
  fetch('/api/save-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({subscription, groupId: currentGroupId})
  })
  .then(response => {
    if (response.ok) {
      console.log('Subscription saved on server.');
    } else {
      console.error('Failed to save subscription on server.');
    }
  })
  .catch(error => {
    console.error('Error sending subscription to server:', error);
  });
}


const applicationServerPublicKey = 'BNqSvLC21J9uKF7zYmGJ4bf10mQzq1rNro0euGkwIVeKZ7UeSuf6OTmFVcu-zm64v9BNUtz765T_Q-lYLK_0fwM';

// 將 VAPID 公鑰從 base64 格式轉換為 Uint8Array
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}