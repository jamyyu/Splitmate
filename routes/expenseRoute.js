import express from 'express';
import multer from 'multer';
import { getExchangeRate, uploadExpenseData, getExpenseData } from '../controllers/expenseController.js';

const router = express.Router();

// 設置 multer 的存儲方式為內存存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get('/api/expense/exchange-rate', getExchangeRate);

router.post('/api/expense',upload.single('image'), uploadExpenseData)

router.get('/api/expense/:groupId', getExpenseData)

export default router;