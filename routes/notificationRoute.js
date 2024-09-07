import express from 'express';
import { saveSubscription, sendNotification } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/api/save-subscription', saveSubscription);

router.post('/api/create-record', sendNotification);

export default router;