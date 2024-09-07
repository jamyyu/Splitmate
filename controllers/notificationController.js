import dotenv from 'dotenv';
import webpush from 'web-push';
import { addSubscription, getSubscriptionsByGroup } from '../models/subscriptionModel.js';

dotenv.config();

const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;


// 設置 VAPID 詳細信息
const vapidKeys = {
  publicKey:  publicKey,
  privateKey: privateKey
};

webpush.setVapidDetails(
  'mailto:jamyyu11@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 保存訂閱信息
export const saveSubscription = (req, res) => {
  const { subscription, groupId } = req.body; // 獲取訂閱信息和群組 ID
  addSubscription(subscription, groupId); // 添加訂閱並關聯群組
  console.log('Subscription saved:', subscription, groupId);
  res.status(201).json({ message: 'Subscription saved successfully.' });
};

// 發送推播通知
export const sendNotification = (req, res) => {
  console.log('收到發送通知的請求:', req.body);
  const { groupId, message } = req.body; // 獲取群組 ID 和消息內容
  const data = JSON.stringify({ 
    title: message.title, 
    body: message.body
  });
  console.log('推送數據:', data);
  const subscriptions = getSubscriptionsByGroup(groupId); // 獲取特定群組的所有訂閱

  subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, data)
      .then(response => console.log('Push notification sent successfully:', response))
      .catch(error => console.error('Error sending push notification:', error));
  });
  res.status(200).json({ message: 'Notification sent.' });
};