import express from 'express';
import { uploadAccountData, getAccountData, deleteAccountData } from '../controllers/accountController.js';

const router = express.Router();

router.post('/api/account', uploadAccountData);

router.get('/api/account/:userId', getAccountData);

router.delete('/api/account/:accountId', deleteAccountData);


export default router;