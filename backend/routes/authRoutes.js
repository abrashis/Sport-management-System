import express from 'express';
import { signup, verifyOTP, requestLoginOTP, login, logout, getMe } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/request-login-otp', requestLoginOTP);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;
