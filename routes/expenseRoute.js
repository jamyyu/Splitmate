import express from 'express';
import multer from 'multer';
import { getExchangeRate, uploadExpenseData, getAllRecordData, getGroupBalanceData, getExpenseData, deleteExpenseData } from '../controllers/expenseController.js';

const router = express.Router();

// 設置 multer 的存儲方式為內存存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get('/api/expense/exchange-rate', getExchangeRate);

router.post('/api/expense',upload.single('image'), uploadExpenseData)

router.get('/api/expense/:groupId/balance', getGroupBalanceData)

router.get('/api/expense/:groupId/:expenseId', getExpenseData)

router.delete('/api/expense/:groupId/:expenseId', deleteExpenseData)

router.get('/api/expense/:groupId', getAllRecordData)



export default router;