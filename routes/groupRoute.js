import express from 'express';
import multer from 'multer';
import { uploadGroupData, getGroupsData, getGroupData } from '../controllers/groupController.js';

const router = express.Router();

// 設置 multer 的存儲方式為內存存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/api/group',upload.single('image'), uploadGroupData);

router.get('/api/group', getGroupsData);

router.get ('/api/group/:groupId', getGroupData);



export default router;