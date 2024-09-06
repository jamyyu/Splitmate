import express from 'express';
import { saveSubscription, sendNotification } from '../controllers/notificationController.js';

const router = express.Router();

// 保存訂閱信息的路由
router.post('/api/save-subscription', saveSubscription);

// 發送推播通知的路由
router.post('/api/create-record', sendNotification);

export default router;