import express from 'express';
import { signUp, signIn, checkAuth, patchUserProfile } from '../controllers/userController.js';
import multer from 'multer';

const router = express.Router();

// 設置 multer 的存儲方式為內存存儲
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/api/user', signUp);

router.post('/api/user/auth', signIn);

router.get('/api/user/auth', checkAuth);

router.patch('/api/user',upload.single('profilePicture'), patchUserProfile)

export default router;