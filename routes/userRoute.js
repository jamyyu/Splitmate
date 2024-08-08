import express from 'express';
import { signUp, signIn, checkAuth } from '../controllers/userController.js';

const router = express.Router();

router.post('/api/user', signUp);

router.post('/api/user/auth', signIn);

router.get('/api/user/auth', checkAuth);

export default router;