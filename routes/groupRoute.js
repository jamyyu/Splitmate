import express from 'express';
import multer from 'multer';
import { uploadGroupData } from '../controllers/groupController.js';

const router = express.Router();

// 設置 multer 的存儲方式為內存存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/api/group',upload.single('image'), uploadGroupData);



export default router;