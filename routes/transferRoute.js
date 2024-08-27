import express from 'express';
import multer from 'multer';
import { uploadTransferData, getTransferData, deleteTransferData } from '../controllers/transferController.js';

const router = express.Router();

// 設置 multer 的存儲方式為內存存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/api/transfer', upload.single('image'), uploadTransferData);

router.get('/api/transfer/:groupId/:transferId', getTransferData);

router.delete('/api/transfer/:groupId/:transferId', deleteTransferData);


export default router;