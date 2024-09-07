import express from 'express';
import { googleLogin } from '../controllers/googleController.js';

const router = express.Router();


router.post('/api/google/auth', googleLogin);


export default router;